import type { PublicKey } from "@blowater/nostr-sdk";

export type UserProfile = {
    pubkey: PublicKey;
    about?: string;
    banner?: string;
    name?: string;
    displayName?: string;
    lud06?: string;
    lud16?: string;
    picture?: string;
    website?: string;
};
