import {
    getTags,
    NostrKind,
    prepareNostrEvent,
    PublicKey,
    type Signer,
    SingleRelayConnection,
    type Tag,
} from "@blowater/nostr-sdk";
import type { Client } from "./sdk.ts";

const Kind_PlaceFollowList = 10016;

export async function getContactList(satlantis_relay: string, pubKey: string | PublicKey) {
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
    let event;
    {
        if (relay instanceof Error) {
            return relay;
        }
        event = await relay.getReplaceableEvent(pub, NostrKind.CONTACTS);
    }

    await relay.close();
    return event;
}

export async function followPubkeys(
    satlantis_relay_url: string,
    toFollow: PublicKey[],
    apiClient: Client,
) {
    const me = await apiClient.getNostrSigner();
    if (me instanceof Error) {
        return me;
    }

    const followEvent = await getContactList(satlantis_relay_url, me.publicKey);
    if (followEvent instanceof Error) {
        return followEvent;
    }

    const follows = new Set<string>();
    if (followEvent) {
        for (const p of getTags(followEvent).p) {
            follows.add(p);
        }
    }
    for (const pub of toFollow) {
        follows.add(pub.hex);
    }

    const tags: Tag[] = [];
    for (const p of follows) {
        tags.push(["p", p]);
    }

    const new_event = await prepareNostrEvent(me, {
        kind: NostrKind.CONTACTS,
        content: "",
        tags,
    });
    if (new_event instanceof Error) {
        return new_event;
    }

    // @ts-ignore: use private
    const ok = await apiClient.updateAccountFollowingList({ event: new_event });
    if (ok instanceof Error) {
        return ok;
    }

    return ok;
}

export async function unfollowPubkeys(
    satlantis_relay_url: string,
    toUnfollow: PublicKey[],
    apiClient: Client,
) {
    const me = await apiClient.getNostrSigner();
    if (me instanceof Error) {
        return me;
    }

    const followEvent = await getContactList(satlantis_relay_url, me.publicKey);
    if (followEvent instanceof Error) {
        return followEvent;
    }

    const follows = new Set<string>();
    if (followEvent) {
        for (const p of getTags(followEvent).p) {
            follows.add(p);
        }
    }

    // Remove all pubkeys that need to be unfollowed
    for (const pub of toUnfollow) {
        follows.delete(pub.hex);
    }

    const tags: Tag[] = [];
    for (const p of follows) {
        tags.push(["p", p]);
    }

    const new_event = await prepareNostrEvent(me, {
        kind: NostrKind.CONTACTS,
        content: "",
        tags,
    });
    if (new_event instanceof Error) {
        return new_event;
    }

    // @ts-ignore: use private
    const ok = await apiClient.updateAccountFollowingList({ event: new_event });
    if (ok instanceof Error) {
        return ok;
    }

    return ok;
}

export async function isUserAFollowingUserB(satlantis_relay_url: string, a: string, b: string) {
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

export async function getPlaceFollowList(satlantis_relay_url: string, pubKey: string) {
    const relay = SingleRelayConnection.New(satlantis_relay_url, { log: false });
    let event;
    {
        if (relay instanceof Error) {
            return relay;
        }
        const pubkey = PublicKey.FromString(pubKey);
        if (pubkey instanceof Error) {
            return pubkey;
        }
        event = relay.getReplaceableEvent(pubkey, Kind_PlaceFollowList as NostrKind);
    }
    await relay.close();
    return event;
}

export const getInterestsOf = async (relay: SingleRelayConnection, pubkey: PublicKey) => {
    const event = await relay.getReplaceableEvent(pubkey, NostrKind.Interests);
    if (event instanceof Error) {
        return event;
    }
    return {
        event,
        interests: event ? getTags(event).t : [],
    };
};

export const getFollowingPubkeys = async (pubkey: PublicKey, relay: SingleRelayConnection) => {
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
async function get_kind3_ContactList(relay: SingleRelayConnection, pubKey: string | PublicKey) {
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
    return await relay.getReplaceableEvent(pub, NostrKind.CONTACTS);
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
