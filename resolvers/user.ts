import type { PublicKey } from "@blowater/nostr-sdk";
import type { Kind0MetaData } from "../models/account.ts";

export class UserProfile {
    metadata: Kind0MetaData = {};

    private constructor(public readonly pubkey: PublicKey) {}

    /**
     * @unstable
     */
    static New(pubkey: PublicKey, metaData: Kind0MetaData, isBusines?: boolean, nip05?: string) {
        const resolver = new UserProfile(pubkey);
        resolver.metadata = metaData;
        return resolver;
    }

    async getNip05() {
    }

    async getIsBusiness() {
    }
}
