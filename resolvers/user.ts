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
        const account = await this.client.getAccount({ npub: this.pubkey.bech32() });
        if (account instanceof Error) {
            return account;
        }
        this.nip5 = account.nip05;
        return this.nip5;
    }

    /**
     * returns true if this user is a business account
     * @unstable
     */
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
            newList.push(new UserResolver(this.client, pub, a));
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
            newList.push(new UserResolver(this.client, pub, a));
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

    interests: string[] = [];
    getInterests = async () => {
        const interests = await this.client.getInterestsOf(this.pubkey);
        if (interests instanceof Error) {
            return interests;
        }
        this.interests = interests.interests;
        return this.interests;
    };

    /**
     * get notes that are created by this user
     */
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
     * get locations owned by this user
     * @unstable
     * @unfinished
     */
    getOwnedLocation = async () => {
        return undefined;
    };
}
