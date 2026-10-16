import {
    getTags,
    type NostrEvent,
    NostrKind,
    prepareNostrEvent,
    PublicKey,
    type Signer,
    SingleRelayConnection,
    type Tag,
    verifyEvent,
} from "@blowater/nostr-sdk";
import type { Client } from "./sdk.ts";

const Kind_PlaceFollowList = 10016;
const FALLBACK_RELAYS = ["wss://relay.primal.net", "wss://relay.damus.io"];
const NIP65_RELAY_LIST_KIND = 10002 as NostrKind;
let replaceableSubCounter = 0;
const followingMutationLocks = new WeakMap<Client, Promise<void>>();
const lastPublishedContactLists = new WeakMap<Client, NostrEvent>();

async function withFollowingMutationLock<T>(
    apiClient: Client,
    operation: () => Promise<T | Error>,
): Promise<T | Error> {
    const previousOperation = followingMutationLocks.get(apiClient) ?? Promise.resolve();
    let releaseCurrentOperation!: () => void;
    const currentOperation = new Promise<void>((resolve) => {
        releaseCurrentOperation = resolve;
    });
    const lock = previousOperation
        .catch(() => undefined)
        .then(() => currentOperation);
    followingMutationLocks.set(apiClient, lock);

    await previousOperation.catch(() => undefined);
    try {
        return await operation();
    } catch (cause) {
        return cause instanceof Error
            ? cause
            : new Error("Unexpected error while updating the following list", {
                cause,
            });
    } finally {
        releaseCurrentOperation();
        if (followingMutationLocks.get(apiClient) === lock) {
            followingMutationLocks.delete(apiClient);
        }
    }
}

export type FollowingChanges = {
    add: PublicKey[];
    remove: PublicKey[];
};

/**
 * Picks the contact list to edit from every copy the relays (and our own cache) returned.
 * Only kind 3 events authored by `authorHex` with a valid signature count; the newest
 * `created_at` wins and a tie goes to the lower event id, as NIP-01 prescribes for replaceable events.
 */
export async function pickNewestContactList(
    events: NostrEvent[],
    authorHex: string,
): Promise<NostrEvent | undefined> {
    const valid: NostrEvent[] = [];
    for (const event of events) {
        if (event.kind !== NostrKind.CONTACTS) continue;
        if (event.pubkey !== authorHex) continue;
        if (!(await verifyEvent(event))) continue;
        valid.push(event);
    }
    return valid.sort((a, b) => {
        if (a.created_at !== b.created_at) return b.created_at - a.created_at;
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    })[0];
}

/**
 * Edits the base contact list in place: drops every `p` tag naming a pubkey in `remove`, then appends
 * `["p", hex]` for each pubkey in `add` that is not already followed. Every other tag (petnames, relay
 * hints, malformed `p` tags, non-`p` tags) and the content are carried over untouched.
 */
export function applyFollowingChanges(
    base: NostrEvent | undefined,
    changes: { add: string[]; remove: string[] },
): { tags: Tag[]; content: string; changed: boolean } {
    const remove = new Set(changes.remove.map((hex) => hex.toLowerCase()));
    const tags: Tag[] = [];
    let changed = false;
    for (const tag of base?.tags ?? []) {
        if (tag[0] === "p" && typeof tag[1] === "string" && remove.has(tag[1].toLowerCase())) {
            changed = true;
            continue;
        }
        tags.push(tag);
    }

    const followed = new Set(
        tags.filter((tag) => tag[0] === "p" && typeof tag[1] === "string").map((tag) => tag[1].toLowerCase()),
    );
    for (const hex of changes.add) {
        const pubkey = hex.toLowerCase();
        if (followed.has(pubkey)) continue;
        followed.add(pubkey);
        tags.push(["p", pubkey]);
        changed = true;
    }

    return { tags, content: base?.content ?? "", changed };
}

/**
 * Relays and the backend keep a replaceable event only if it is strictly newer than the stored one,
 * so a second publish in the same second (or over a future-dated base) must move past the base.
 */
export function nextCreatedAt(base: NostrEvent | undefined, nowSec: number) {
    return base ? Math.max(nowSec, base.created_at + 1) : nowSec;
}

/**
 * Every contact list copy for `author` found on the fallback relays, the bootstrap relays, and the
 * write relays from the author's NIP-65 list. Unreachable relays are skipped.
 */
export async function getContactListsFromRelays(
    author: PublicKey,
    bootstrapRelays: string[],
): Promise<NostrEvent[]> {
    const relays = new Set<string>([...FALLBACK_RELAYS, ...bootstrapRelays]);
    const relayList = await getReplaceableEventFromRelays(
        Array.from(relays),
        author,
        NIP65_RELAY_LIST_KIND,
    );
    if (!(relayList instanceof Error) && relayList) {
        for (const tag of relayList.tags) {
            if (tag[0] === "r" && tag[1]?.startsWith("wss://")) relays.add(tag[1]);
        }
    }
    return getReplaceableEventsFromRelays(Array.from(relays), author, NostrKind.CONTACTS);
}

async function getReplaceableEventFromRelays(
    relayUrls: string[],
    pubkey: PublicKey,
    kind: NostrKind,
): Promise<NostrEvent | Error | undefined> {
    const results = await Promise.all(
        relayUrls.map(async (url) => {
            const event = await getContactList(url, pubkey, kind);
            return event instanceof Error ? undefined : event;
        }),
    );
    return results
        .filter((event): event is NostrEvent => Boolean(event))
        .sort((a, b) => b.created_at - a.created_at)[0];
}

async function getReplaceableEventsFromRelays(
    relayUrls: string[],
    pubkey: PublicKey,
    kind: NostrKind,
) {
    const results = await Promise.all(
        relayUrls.map(async (url) => {
            const event = await getContactList(url, pubkey, kind);
            return event instanceof Error ? undefined : event;
        }),
    );
    return results.filter((event): event is NostrEvent => Boolean(event));
}

/**
 * Applies `changes` to the signer's newest contact list in one read and one publish.
 *
 * The backend fans the event out to relays asynchronously, so relays may not have our previous
 * publish yet; the last event this client published is therefore always a base candidate too.
 */
export async function updateFollowings(
    apiClient: Client,
    changes: FollowingChanges,
    loadContactLists: (author: PublicKey) => Promise<NostrEvent[]>,
): Promise<true | Error> {
    return withFollowingMutationLock(apiClient, async () => {
        const signer = await apiClient.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const candidates = await loadContactLists(signer.publicKey);
        const lastPublished = lastPublishedContactLists.get(apiClient);
        if (lastPublished) candidates.push(lastPublished);
        const base = await pickNewestContactList(candidates, signer.publicKey.hex);
        if (!base) {
            const account = await apiClient.getAccount({
                npub: signer.publicKey.bech32(),
            });
            if (account instanceof Error) {
                return new Error(
                    "Could not verify the account before updating the following list",
                    { cause: account },
                );
            }
            if ((account.followingCount ?? 0) > 0) {
                return new Error("Relays returned no kind 3 for an account with existing follows");
            }
        }

        const { tags, content, changed } = applyFollowingChanges(base, {
            add: changes.add.map((pubkey) => pubkey.hex),
            remove: changes.remove.map((pubkey) => pubkey.hex),
        });
        if (!changed) {
            return true;
        }

        const event = await prepareNostrEvent(signer, {
            kind: NostrKind.CONTACTS,
            content,
            tags,
            created_at: nextCreatedAt(base, Math.floor(Date.now() / 1000)),
        });
        if (event instanceof Error) {
            return event;
        }

        // @ts-ignore: use private
        const result = await apiClient.updateAccountFollowingList({ event });
        if (result instanceof Error) {
            return result;
        }
        if (!result) {
            return new Error("The server did not accept the following list update");
        }
        lastPublishedContactLists.set(apiClient, event);
        return true;
    });
}

function replaceableSubId(pubkey: PublicKey, kind: NostrKind) {
    replaceableSubCounter = (replaceableSubCounter + 1) % 46_656;
    return `rp:${kind}:${pubkey.hex.slice(0, 8)}:${replaceableSubCounter.toString(36)}`;
}

async function getReplaceableEvent(
    relay: SingleRelayConnection,
    pubkey: PublicKey,
    kind: NostrKind,
): Promise<NostrEvent | Error | undefined> {
    const subID = replaceableSubId(pubkey, kind);
    const events = await relay.newSub(subID, {
        authors: [pubkey.hex],
        kinds: [kind],
        limit: 1,
    });
    if (events instanceof Error) {
        return events;
    }

    let result: Error | undefined;
    let latestEvent: NostrEvent | undefined;
    for await (const msg of events.chan) {
        if (msg.type == "EVENT") {
            if (!latestEvent || msg.event.created_at > latestEvent.created_at) {
                latestEvent = msg.event;
            }
            continue;
        }
        if (msg.type == "NOTICE") {
            result = new Error(msg.note);
            break;
        }
        if (msg.type == "EOSE") {
            break;
        }
    }

    const err = await relay.closeSub(subID);
    if (err instanceof Error && result == undefined) {
        return err;
    }
    return result || latestEvent;
}

export async function getContactList(
    satlantis_relay: string,
    pubKey: string | PublicKey,
    kind: NostrKind = NostrKind.CONTACTS,
) {
    let pub: PublicKey;
    if (typeof pubKey == "string") {
        const _pubKey = PublicKey.FromString(pubKey);
        if (_pubKey instanceof Error) {
            return _pubKey;
        }
        pub = _pubKey;
    } else {
        pub = pubKey;
    }
    const relay = SingleRelayConnection.New(satlantis_relay, { log: false });
    if (relay instanceof Error) {
        return relay;
    }
    const event = await getReplaceableEvent(relay, pub, kind);
    await relay.close();
    return event;
}

export async function followPubkeys(
    satlantis_relay_url: string,
    toFollow: PublicKey[],
    apiClient: Client,
) {
    return updateFollowings(
        apiClient,
        { add: toFollow, remove: [] },
        (author) => getContactListsFromRelays(author, [satlantis_relay_url]),
    );
}

export async function unfollowPubkeys(
    satlantis_relay_url: string,
    toUnfollow: PublicKey[],
    apiClient: Client,
) {
    return updateFollowings(
        apiClient,
        { add: [], remove: toUnfollow },
        (author) => getContactListsFromRelays(author, [satlantis_relay_url]),
    );
}

export async function isUserAFollowingUserB(
    satlantis_relay_url: string,
    a: string,
    b: string,
) {
    const event = await getContactList(satlantis_relay_url, a);
    if (event instanceof Error) {
        return event;
    }
    if (event == undefined) {
        return false;
    }
    const tags = getTags(event);
    for (const pubkey of tags.p) {
        if (pubkey == b) {
            return true;
        }
    }
    return false;
}

export async function getPlaceFollowList(
    satlantis_relay_url: string,
    pubKey: string,
) {
    const relay = SingleRelayConnection.New(satlantis_relay_url, { log: false });
    if (relay instanceof Error) {
        return relay;
    }
    const pubkey = PublicKey.FromString(pubKey);
    if (pubkey instanceof Error) {
        await relay.close();
        return pubkey;
    }
    const event = await getReplaceableEvent(
        relay,
        pubkey,
        Kind_PlaceFollowList as NostrKind,
    );
    await relay.close();
    return event;
}

export const getInterestsOf = async (
    relay: SingleRelayConnection,
    pubkey: PublicKey,
) => {
    const event = await getReplaceableEvent(relay, pubkey, NostrKind.Interests);
    if (event instanceof Error) {
        return event;
    }
    return {
        event,
        interests: event ? getTags(event).t : [],
    };
};

export const getFollowingPubkeys = async (
    pubkey: PublicKey,
    relay: SingleRelayConnection,
) => {
    const followEvent = await get_kind3_ContactList(relay, pubkey);
    if (followEvent instanceof Error) {
        return followEvent;
    }
    if (followEvent == undefined) {
        return new Set<string>();
    }
    return new Set(getTags(followEvent).p);
};

/**
 * also know as nostr following list
 */
async function get_kind3_ContactList(
    relay: SingleRelayConnection,
    pubKey: string | PublicKey,
) {
    let pub: PublicKey;
    if (typeof pubKey == "string") {
        const _pubKey = PublicKey.FromString(pubKey);
        if (_pubKey instanceof Error) {
            return _pubKey;
        }
        pub = _pubKey;
    } else {
        pub = pubKey;
    }
    return await getReplaceableEvent(relay, pub, NostrKind.CONTACTS);
}

export async function prepareLocationSetEvent(signer: Signer) {
    return prepareNostrEvent(signer, {
        content: "",
        kind: 10515 as NostrKind,
        tags: [
            ["d", "jvdy9i4"],
            ["name", "Business Locations"],
            [
                "a",
                "37515:26dc95542e18b8b7aec2f14610f55c335abebec76f3db9e58c254661d0593a0c:95ODQzw3ajNoZ8SyMDOzQ",
            ],
            [
                "a",
                "37515:54af95542e18b8b7aec2f14610f55c335abebec76f3db9e58c254661d0593a0c:1-MYP8dAhramH9J5gJWKx",
            ],
            [
                "a",
                "37515:f8fe95542e18b8b7aec2f14610f55c335abebec76f3db9e58c254661d0593a0c:D2Tbd38bGrFvU0bIbvSMt",
            ],
        ],
    });
}

export async function preparePlaceEvent(
    signer: Signer,
    args: {
        placeName: string;
    },
) {
    return prepareNostrEvent(signer, {
        kind: 37515 as NostrKind,
        content:
            '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"coordinates":[14.425692, 50.095986],"type":"Point"}}]}', // stringified JSON. Use https://geojson.io to easily create GeoJSON objects for testing.
        tags: [
            ["d", "zahradní-restaurace-letenský-zámeček-u2fkbr"], // unique identifier for replaceable event
            ["name", args.placeName], // name property
            // ["opening_hours", "Mo-Fr_6:00-20:00,Sa-Su_6:00-17:00"], // opening_hours property
            // ["logo_url", "https://nostr.build/logo.png"], // logo_url property
            // ["r", "R4469371", "osm_ref"], // osm_ref is a combination of the OSM type (the letter at the front of the string) and OSM ID (which is the numerical value following the letter
            // ["amenity", "biergarten"], // OSM amenity tag
            // ["country", "Czech"], // country property
            // ["contributor", "5c83da77af1dec6d7289834998ad7aafbd9e2191396d75ec3cc27f5a77226f36"],
            // ["contributor", "f7234bd4c1394dda46d09f35bd384dd30cc552ad5541990f98844fb06676e9ca"],
            // ["g", "u2fkbr"], // geohash of place; should be as accurate as possible
            // ["g", "u2fkb"], // all less-precise geohashes must be defined to allow for searching -- see https://github.com/nostr-protocol/nips/pull/136#issuecomment-1788549584
            // ["g", "u2fk"],
            // ["g", "u2f"],
            // ["g", "u2"],
            // ["g", "u"],
            // [
            //     "a",
            //     "37515:26dc95542e18b8b7aec2f14610f55c335abebec76f3db9e58c254661d0593a0c:95ODQzw3ajNoZ8SyMDOzQ",
            // ], // Reference to old Place Event which has been replaced by this event (so we can link old reviews)
        ],
    });
}
