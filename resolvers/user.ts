import type { PublicKey } from "@blowater/nostr-sdk";
import type { Kind0MetaData } from "../models/account.ts";
import { type Client } from "../sdk.ts";

export class UserProfile {
    metadata: Kind0MetaData = {};
    nip5: string | undefined;
    isBusiness: boolean | undefined;

    private constructor(
        public readonly pubkey: PublicKey,
        private readonly client: Client,
    ) {}

    /**
     * Should not be called by application code directly
     * @unstable
     */
    static New(pubkey: PublicKey, metaData: Kind0MetaData, args: {
        isBusines?: boolean;
        nip05?: string;
        client: Client;
    }) {
        const resolver = new UserProfile(pubkey, args.client);
        resolver.metadata = metaData;
        return resolver;
    }

    async getNip05() {
        const account = await this.client.getAccount({ npub: this.pubkey.bech32() });
        if (account instanceof Error) {
            return account;
        }
        this.nip5 = account.nip05;
        return this.nip5;
    }

    async getIsBusiness() {
        const account = await this.client.getAccount({ npub: this.pubkey.bech32() });
        if (account instanceof Error) {
            return account;
        }
        this.isBusiness = account.isBusiness;
        return this.isBusiness;
    }
}
