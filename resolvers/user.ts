import { PublicKey } from "@blowater/nostr-sdk";
import type { Kind0MetaData } from "../models/account.ts";
import { AccountPlaceRoleTypeEnum, type Client } from "../sdk.ts";
import { NoteResolver } from "./note.ts";
import { LocationResolver } from "./location.ts";

export class UserResolver {
    metaData: Kind0MetaData;

    /**
     * Should not be called by application code directly
     * @experimental
     */
    constructor(
        private readonly client: Client,
        public readonly pubkey: PublicKey,
        public isAdmin: boolean,
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

    async getAccount() {
        return await this.client.getAccount({ npub: this.pubkey.bech32() });
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
                console.error(`account ${a.id} has invalid pubkey`, pub);
                continue;
            }
            newList.push(new UserResolver(this.client, pub, a.isAdmin, a));
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
                console.error(`account ${a.id} has invalid pubkey`, pub);
                continue;
            }
            newList.push(new UserResolver(this.client, pub, a.isAdmin, a));
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
     * get notes that are created by this user from Satlantis Relay
     *
     * @experimental @unstable use it with caution
     */
    getNotes = async (args: { limit: number; page?: number }) => {
        const notes = await this.client.getNotesOf({
            pubkey: this.pubkey,
            page: {
                limit: args.limit,
                offset: (args.page || 0) * args.limit,
            },
        });
        if (notes instanceof Error) {
            return notes;
        }
        const noteResolvers = [];
        for await (const note of notes) {
            const r = new NoteResolver(this.client, { type: "nostr", data: note });
            noteResolvers.push(r);
        }
        return noteResolvers;
    };

    /**
     * get notes that are created by this user from Backend REST API
     */
    getNotesFromRestAPI = async (args: { limit: number; page?: number }) => {
        // @ts-ignore: use private
        const notes = await this.client.getNotesOfPubkey({
            npub: this.pubkey.bech32(),
            page: args.page || 1,
            limit: args.limit,
        });
        if (notes instanceof Error) {
            return notes;
        }
        const noteResolvers = [];
        for await (const note of notes) {
            const r = new NoteResolver(this.client, { type: "backend", data: note });
            noteResolvers.push(r);
        }
        return noteResolvers;
    };

    /**
     * get locations owned by this user
     * @unstable
     */
    getOwnedLocation = async () => {
        const account = await this.client.getAccount({ npub: this.pubkey.bech32() });
        if (account instanceof Error) {
            return account;
        }

        return account.locations?.filter((AccountLoaction) => AccountLoaction.type === "owner").map(
            (AccountLoaction) => {
                return new LocationResolver(this.client, AccountLoaction.location);
            },
        );
    };

    isPlaceAdmin = async (placeId: number) => {
        const account = await this.client.getAccount({ npub: this.pubkey.bech32() });
        if (account instanceof Error) {
            return account;
        }

        return (
            account.accountPlaceRoles?.some((accountPlace) => {
                return (
                    accountPlace.placeId === placeId &&
                    accountPlace.type === AccountPlaceRoleTypeEnum.AMBASSADOR
                );
            }) || false
        );
    };
}
