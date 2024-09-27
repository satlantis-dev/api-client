import { PublicKey } from "@blowater/nostr-sdk";
import type { Kind0MetaData } from "../models/account.ts";
import { type Client } from "../sdk.ts";

export class UserResolver {
    metaData: Kind0MetaData;

    /**
     * Should not be called by application code directly
     * @unstable
     */
    constructor(
        private readonly client: Client,
        public readonly pubkey: PublicKey,
        metaData?: Kind0MetaData,
        public nip5?: string,
        public isBusiness?: boolean,
    ) {
        this.metaData = metaData || {};
    }

    async getNip05() {
        // @ts-ignore: use private
        const account = await this.client.getAccount({ npub: this.pubkey.bech32() });
        if (account instanceof Error) {
            return account;
        }
        this.nip5 = account.nip05;
        return this.nip5;
    }

    async getIsBusiness() {
        // @ts-ignore: use private
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
        // @ts-ignore: use private
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
            newList.push(new UserResolver(this.client, pub, a));
        }
        this.following = newList;
        return newList;
    }

    followedBy: UserResolver[] = [];
    getFollowedBy = async () => {
        // @ts-ignore: use private
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
            newList.push(new UserResolver(this.client, pub, a));
        }
        this.followedBy = newList;
        return this.followedBy;
    };

    getAccountPlaceRoles = async () => {
        // @ts-ignore: use private
        const account = await this.client.getAccount({ npub: this.pubkey.bech32() });
        if (account instanceof Error) {
            return account;
        }
        return account.accountPlaceRoles || [];
    };

    interests: string[] = [];
    getInterests = async () => {
        const interests = await this.client.getInterestsOf(this.pubkey);
        if (interests instanceof Error) {
            return interests;
        }
        this.interests = interests.interests;
        return this.interests;
    };

    getNotes = async (args: { limit: number }) => {
        return this.client.getNotesOf({
            pubkey: this.pubkey,
            page: {
                limit: args.limit,
                offset: 0,
            },
        });
    };

    /**
     * @unstable
     * @unfinished
     */
    getOwnedLocation = async () => {
        return undefined;
    };
}
