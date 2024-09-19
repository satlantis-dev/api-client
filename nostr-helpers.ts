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
import type { Client, UserProfile } from "./sdk.ts";

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
    me: Signer,
    toFollow: PublicKey[],
    apiClient: Client,
) {
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

    const err = await publishEvent(satlantis_relay_url, new_event);
    if (err instanceof Error) {
        return err;
    }

    const ok = await apiClient.updateAccountFollowingList({ event: new_event });
    if (ok instanceof Error) {
        return ok;
    }

    return ok;
}

async function publishEvent(satlantis_relay_url: string, event: NostrEvent) {
    const relay = SingleRelayConnection.New(satlantis_relay_url, { log: false });
    if (relay instanceof Error) {
        return relay;
    }
    const ok = await relay.sendEvent(event);
    if (ok instanceof Error) {
        return ok;
    }
    await relay.close();
}

export async function getFollowingPubkeys(satlantis_relay_url: string, pubkey: string | PublicKey) {
    const list = new Set<string>();
    const event = await getContactList(satlantis_relay_url, pubkey);
    if (event instanceof Error) {
        return event;
    }
    if (event == undefined) {
        return list;
    }
    const tags = getTags(event);
    for (const pubkey of tags.p) {
        list.add(pubkey);
    }
    return list;
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

export async function getProfile(satlantis_relay_url: string, pubkey: PublicKey): Promise<UserProfile | Error> {
    const relay = SingleRelayConnection.New(satlantis_relay_url, { log: false });
    let event;
    {
        if (relay instanceof Error) {
            return relay;
        }
        event = await relay.getReplaceableEvent(pubkey, NostrKind.META_DATA);
    }
    await relay.close();
    if(event instanceof Error) {
        return event
    }
    if(event == undefined) {
        return {
            pubkey
        }
    }
    const obj = JSON.parse(event.content)
    return {
        ...obj,
        pubkey
    }
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
