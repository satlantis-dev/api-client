import {
  getTags,
  type NostrEvent,
  NostrKind,
  prepareNostrEvent,
  PublicKey,
  type Signer,
  SingleRelayConnection,
  type Tag,
} from "@blowater/nostr-sdk";
import type { Client } from "./sdk.ts";

const Kind_PlaceFollowList = 10016;
const FALLBACK_RELAYS = ["wss://relay.primal.net", "wss://relay.damus.io"];
const NIP65_RELAY_LIST_KIND = 10002 as NostrKind;
let replaceableSubCounter = 0;
const followingMutationLocks = new WeakMap<Client, Promise<void>>();

async function withFollowingMutationLock<T>(
  apiClient: Client,
  operation: () => Promise<T | Error>,
): Promise<T | Error> {
  const previousOperation =
    followingMutationLocks.get(apiClient) ?? Promise.resolve();
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

async function getFollowingBaseline(
  apiClient: Client,
  signer: Signer,
  bootstrapRelays: string[],
): Promise<Set<string> | Error> {
  const relayList = await getReplaceableEventFromRelays(
    Array.from(new Set([...FALLBACK_RELAYS, ...bootstrapRelays])),
    signer.publicKey,
    NIP65_RELAY_LIST_KIND,
  );
  const relays = new Set<string>([...FALLBACK_RELAYS, ...bootstrapRelays]);
  if (!(relayList instanceof Error) && relayList) {
    for (const tag of relayList.tags) {
      if (tag[0] === "r" && tag[1]?.startsWith("wss://")) relays.add(tag[1]);
    }
  }
  const contactLists = await getReplaceableEventsFromRelays(
    Array.from(relays),
    signer.publicKey,
    NostrKind.CONTACTS,
  );
  const baseline = new Set<string>();
  const followingPubkeys = contactLists.flatMap((event) => getTags(event).p);
  if (contactLists.length === 0) {
    const account = await apiClient.getAccount({
      npub: signer.publicKey.bech32(),
    });
    if (account instanceof Error) {
      return new Error(
        "Could not verify the account before updating the following list",
        {
          cause: account,
        },
      );
    }
    if ((account.followingCount ?? 0) > 0) {
      return new Error(
        "Primal returned no kind 3 for an account with existing follows",
      );
    }
  }
  for (const followingPubkey of followingPubkeys) {
    const pubkey = PublicKey.FromHex(followingPubkey);
    if (pubkey instanceof Error) {
      return new Error(
        `Relay returned an invalid following pubkey: ${followingPubkey}`,
        {
          cause: pubkey,
        },
      );
    }
    baseline.add(pubkey.hex);
  }

  return baseline;
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

async function updateFollowingPubkeys(
  apiClient: Client,
  mutate: (followings: Set<string>) => boolean,
  bootstrapRelays: string[] = [],
) {
  return withFollowingMutationLock(apiClient, async () => {
    const signer = await apiClient.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    const followings = await getFollowingBaseline(
      apiClient,
      signer,
      bootstrapRelays,
    );
    if (followings instanceof Error) {
      return followings;
    }

    const changed = mutate(followings);
    if (!changed) {
      return true;
    }

    const tags: Tag[] = Array.from(followings, (pubkey) => ["p", pubkey]);
    const event = await prepareNostrEvent(signer, {
      kind: NostrKind.CONTACTS,
      content: "",
      tags,
    });
    if (event instanceof Error) {
      return event;
    }

    // @ts-ignore: use private
    const result = await apiClient.updateAccountFollowingList({ event });
    return result;
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
  return updateFollowingPubkeys(
    apiClient,
    (followings) => {
      let changed = false;
      for (const pubkey of toFollow) {
        if (!followings.has(pubkey.hex)) {
          followings.add(pubkey.hex);
          changed = true;
        }
      }
      return changed;
    },
    [satlantis_relay_url],
  );
}

export async function unfollowPubkeys(
  satlantis_relay_url: string,
  toUnfollow: PublicKey[],
  apiClient: Client,
) {
  return updateFollowingPubkeys(
    apiClient,
    (followings) => {
      let changed = false;
      for (const pubkey of toUnfollow) {
        changed = followings.delete(pubkey.hex) || changed;
      }
      return changed;
    },
    [satlantis_relay_url],
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
