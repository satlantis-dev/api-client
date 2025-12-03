import { PublicKey } from "@blowater/nostr-sdk";
import type { Kind0MetaData } from "../models/account.ts";
import { AccountPlaceRoleTypeEnum, CalendarEventPeriod, type Client } from "../sdk.ts";
import { NoteResolver } from "./note.ts";
import { LocationResolver } from "./location.ts";
import { RsvpStatus } from "../api/events.ts";

export class UserResolver {
    metaData: Kind0MetaData;

    /**
     * Should not be called by application code directly
     * @experimental
     */
    constructor(
        private readonly client: Client,
        public readonly pubkey: PublicKey,
        public readonly isAdmin: boolean,
        public isBusiness: boolean,
        public nip5: string | undefined,
        metaData: Kind0MetaData,
    ) {
        this.metaData = metaData || {};
    }

    /**
     * @deprecated nip05 is not changeable. No need to fetch the "latest" value
     */
    async getNip05() {
        const account = await this.client.getAccount({
            npub: this.pubkey.bech32(),
        });
        if (account instanceof Error) {
            return account;
        }
        this.nip5 = account.nip05;
        return this.nip5;
    }

    async getAccount(options?: { useCache: boolean }) {
        return await this.client.getAccount({ npub: this.pubkey.bech32() }, options);
    }

    /**
     * returns true if this user is a business account
     * @deprecated isBusiness is now available during resolver construction
     */
    async getIsBusiness() {
        const account = await this.client.getAccount({
            npub: this.pubkey.bech32(),
        });
        if (account instanceof Error) {
            return account;
        }
        this.isBusiness = account.isBusiness;
        return this.isBusiness;
    }

    /**
     * @deprecated
     */
    following: UserResolver[] = [];
    /**
     * @deprecated account.following will be removed in a future version
     */
    async getFollowing(options?: { useCache: boolean }) {
        const account = await this.client.getAccount(
            { npub: this.pubkey.bech32() },
            options,
        );
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
            const u = new UserResolver(
                this.client,
                pub,
                a.isAdmin,
                a.isBusiness,
                a.nip05,
                a,
            );
            newList.push(u);
        }
        this.following = newList;
        return newList;
    }

    /**
     * @deprecated
     */
    followedBy: UserResolver[] = [];
    /**
     * @deprecated account.followedBy will be removed in a future version
     */
    getFollowedBy = async (options?: { useCache: boolean }) => {
        const account = await this.client.getAccount(
            { npub: this.pubkey.bech32() },
            options,
        );
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
            newList.push(
                new UserResolver(this.client, pub, a.isAdmin, a.isBusiness, a.nip05, a),
            );
        }
        this.followedBy = newList;
        return this.followedBy;
    };

    getAccountPlaceRoles = async (options?: { useCache: boolean }) => {
        const account = await this.client.getAccount(
            { npub: this.pubkey.bech32() },
            options,
        );
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
     * @experimental
     */
    getOwnedLocation = async (options?: { useCache: boolean }) => {
        const account = await this.client.getAccount(
            { npub: this.pubkey.bech32() },
            options,
        );
        if (account instanceof Error) {
            return account;
        }
        if (!account.locations) {
            return [];
        }

        return account.locations
            .filter((AccountLoaction) => AccountLoaction.type === "owner")
            .map((AccountLoaction) => {
                // @ts-ignore: missing placeOsmRef from the beckend
                return new LocationResolver(this.client, AccountLoaction.location);
            });
    };

    isPlaceAdmin = async (placeId: number, options?: { useCache: boolean }) => {
        const account = await this.client.getAccount(
            { npub: this.pubkey.bech32() },
            options,
        );
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

    getCalendarEvents = async (
        period: CalendarEventPeriod = CalendarEventPeriod.Upcoming,
        rsvp?: RsvpStatus,
        isOrganizer?: boolean,
    ) => {
        let eventParams: {
            npub: string;
            period: CalendarEventPeriod;
            rsvp?: RsvpStatus;
            isOrganizer?: boolean;
        } = {
            npub: this.pubkey.bech32(),
            period,
        };

        if (rsvp) {
            eventParams = { ...eventParams, rsvp };
        }

        if (typeof isOrganizer === "boolean") {
            eventParams = { ...eventParams, isOrganizer };
        }
        const events = await this.client.getAccountCalendarEvents(eventParams);
        if (events instanceof Error) {
            return events;
        }
        return events;
    };
}
