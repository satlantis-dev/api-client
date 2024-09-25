import { PublicKey } from "@blowater/nostr-sdk";
import type { Kind0MetaData } from "../models/account.ts";
import { type Client } from "../sdk.ts";

export class UserResolver {
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
        isBusiness?: boolean;
        nip05?: string;
        client: Client;
    }) {
        const resolver = new UserResolver(pubkey, args.client);
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

    /**
     * @unstable
     */
    following: UserResolver[] = [];
    /**
     * @unstable
     */
    async getFollowing() {
        const account = await this.client.getAccount({ npub: this.pubkey.bech32() });
        if (account instanceof Error) {
            return account;
        }
        const newList = [];
        for (const a of account.following) {
            const pub = PublicKey.FromHex(a.pubKey);
            if (pub instanceof Error) {
                throw pub; // impossible
            }
            newList.push(UserResolver.New(pub, a, { client: this.client }));
        }
        this.following = newList;
        return newList;
    }

    followedBy: UserResolver[] = [];
    getFollowedBy = async () => {
        const account = await this.client.getAccount({ npub: this.pubkey.bech32() });
        if (account instanceof Error) {
            return account;
        }
        const newList = [];
        for (const a of account.followedBy) {
            const pub = PublicKey.FromHex(a.pubKey);
            if (pub instanceof Error) {
                throw pub; // impossible
            }
            newList.push(UserResolver.New(pub, a, { client: this.client }));
        }
        this.followedBy = newList;
        return this.followedBy;
    };

    getAccountPlaceRoles = async () => {
        const account = await this.client.getAccount({ npub: this.pubkey.bech32() });
        if (account instanceof Error) {
            return account;
        }
        return account.accountPlaceRoles || [];
    };
}
