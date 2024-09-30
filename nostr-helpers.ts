import {
    getTags,
    NostrKind,
    prepareNostrEvent,
    PublicKey,
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
