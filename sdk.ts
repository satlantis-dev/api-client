import {
    type Encrypter,
    type NostrEvent,
    NostrKind,
    NoteID,
    prepareEncryptedNostrEvent,
    prepareNostrEvent,
    PublicKey,
    type RelayResponse_REQ_Message,
    type Signer,
    SingleRelayConnection,
    type Tag,
} from "@blowater/nostr-sdk";

import {
    createAccount,
    getAccount,
    initiatePasswordReset,
    login,
    resetPassword,
    verifyEmail,
} from "./api/account.ts";
import { getIpInfo } from "./api/ip.ts";
import {
    claimLocation,
    getAccountsForLocation,
    getLocation,
    getLocationReviews,
    getLocationsByPlaceID,
    getLocationsWithinBoundingBox,
    getLocationTags,
    proveLocationClaim,
    updateLocation,
} from "./api/location.ts";
import { loginNostr } from "./api/login.ts";
import { getNote, getNotes, getNotesOfPubkey, NoteType } from "./api/note.ts";
import { getAccountPlaceRoles } from "./api/people.ts";
import {
    getPlaceByOsmRef,
    getPlaceCalendarEvents,
    getPlaceCategoryScores,
    getPlaceChats,
    getPlaceEvent,
    getPlaceGallery,
    getPlaceMetrics,
    getPlaceNotes,
    getPlaces,
    getPlacesMinimal,
    getRegion,
} from "./api/place.ts";
import {
    addAccountRole,
    deleteAccount,
    getAccountsBySearch,
    removeAccountRole,
    updateAccount,
    updateAccountFollowingList,
} from "./api/secure/account.ts";
import { updatePlace } from "./api/secure/place.ts";
import { deleteNote, postNote, postReaction } from "./api/secure/note.ts";
import { presign } from "./api/secure/presign.ts";
import { newURL } from "./helpers/_helper.ts";
import { addressLookup } from "./api/address.ts";
import { signEvent } from "./api/nostr_event.ts";
import { createInterests, getAccountInterests, getInterests } from "./api/secure/interests.ts";
import {
    deletePlaceCalendarEvent,
    postCalendarEventAnnouncement,
    postCalendarEventNote,
    postCalendarEventRSVP,
    postPlaceCalendarEvent,
    putUpdateCalendarEvent,
} from "./api/secure/calendar.ts";
import { followPubkeys, getFollowingPubkeys, getInterestsOf } from "./nostr-helpers.ts";
import { getPubkeyByNip05 } from "./api/nip5.ts";
import { safeFetch } from "./helpers/safe-fetch.ts";
import type { Account, Kind0MetaData } from "./models/account.ts";
import { UserResolver } from "./resolvers/user.ts";
import { LocationResolver } from "./resolvers/location.ts";
import { NoteResolver } from "./resolvers/note.ts";
import type { Place } from "./models/place.ts";
import type { LocationCategory, LocationCategoryName, LocationTag } from "./models/location.ts";
import { postAmbassadorInquiry } from "./api/secure/ambassador.ts";
import type { Interest } from "./models/interest.ts";

export type func_GetNostrSigner = () => Promise<(Signer & Encrypter) | Error>;
export type func_GetJwt = () => string;

export class Client {
    // Caches
    private me: UserResolver | undefined = undefined;
    private users = new Map<string, UserResolver>();
    private accounts = new Map<string, Account>();
    private places = new Map<number | string, Place>();

    // Place
    getAccountPlaceRoles: ReturnType<typeof getAccountPlaceRoles>;
    private _getPlaceByOsmRef: ReturnType<typeof getPlaceByOsmRef>;
    private _getPlaces: ReturnType<typeof getPlaces>;
    getPlaceEvent: ReturnType<typeof getPlaceEvent>;
    getPlaceNotes: ReturnType<typeof getPlaceNotes>;
    getPlaceMetrics: ReturnType<typeof getPlaceMetrics>;
    getPlaceGallery: ReturnType<typeof getPlaceGallery>;
    getPlaceChats: ReturnType<typeof getPlaceChats>;
    getPlaceCategoryScores: ReturnType<typeof getPlaceCategoryScores>;

    getRegion: ReturnType<typeof getRegion>;

    // Calendar Events
    getPlaceCalendarEvents: ReturnType<typeof getPlaceCalendarEvents>;
    deletePlaceCalendarEvent: ReturnType<typeof deletePlaceCalendarEvent>;
    postCalendarEventRSVP: ReturnType<typeof postCalendarEventRSVP>;
    postPlaceCalendarEvent: ReturnType<typeof postPlaceCalendarEvent>;
    postCalendarEventAnnouncement: ReturnType<typeof postCalendarEventAnnouncement>;
    postCalendarEventNote: ReturnType<typeof postCalendarEventNote>;
    putUpdateCalendarEvent: ReturnType<typeof putUpdateCalendarEvent>;

    // Account
    /**
     * @unstable
     */
    private _getAccount: ReturnType<typeof getAccount>;
    getAccountsBySearch: ReturnType<typeof getAccountsBySearch>;
    createAccount: ReturnType<typeof createAccount>;
    /**
     * @unstable
     */
    private updateAccount: ReturnType<typeof updateAccount>;
    deleteAccount: ReturnType<typeof deleteAccount>;

    // note
    private getNotesOfPubkey: ReturnType<typeof getNotesOfPubkey>;
    private getNotes: ReturnType<typeof getNotes>;
    getNote: ReturnType<typeof getNote>;
    getIpInfo: ReturnType<typeof getIpInfo>;

    // Location
    getLocationsWithinBoundingBox: ReturnType<typeof getLocationsWithinBoundingBox>;
    getLocationReviews: ReturnType<typeof getLocationReviews>;
    private getLocationByID: ReturnType<typeof getLocation>;
    private getLocationsByPlaceID: ReturnType<typeof getLocationsByPlaceID>;
    private _claimLocation: ReturnType<typeof claimLocation>;
    proveLocationClaim: ReturnType<typeof proveLocationClaim>;
    updateLocation: ReturnType<typeof updateLocation>;
    private getAccountsForLocation: ReturnType<typeof getAccountsForLocation>;

    //
    addressLookup: ReturnType<typeof addressLookup>;

    // auth
    loginNostr: ReturnType<typeof loginNostr>;
    login: ReturnType<typeof login>;
    initiatePasswordReset: ReturnType<typeof initiatePasswordReset>;
    resetPassword: ReturnType<typeof resetPassword>;
    verifyEmail: ReturnType<typeof verifyEmail>;
    /////////////////
    // authed APIs //
    /////////////////
    // acount role
    removeAccountRole: ReturnType<typeof removeAccountRole>;
    addAccountRole: ReturnType<typeof addAccountRole>;
    /**
     * @unstable
     */
    private updateAccountFollowingList: ReturnType<typeof updateAccountFollowingList>;
    /**
     * get a list of interests acknowledged by the backend
     */
    createInterests: ReturnType<typeof createInterests>;
    getAccountInterests: ReturnType<typeof getAccountInterests>;
    getInterests: ReturnType<typeof getInterests>;

    // nostr note
    /**
     * @deprecated prefer to other .post methods
     * remove after: 2024/11/01
     */
    _postNote: ReturnType<typeof postNote>;
    deleteNote: ReturnType<typeof deleteNote>;
    postReaction: ReturnType<typeof postReaction>;
    signEvent: ReturnType<typeof signEvent>;

    // s3
    private presign: ReturnType<typeof presign>;

    // place
    updatePlace: ReturnType<typeof updatePlace>;

    // Ambassador
    postAmbassadorInquiry: ReturnType<typeof postAmbassadorInquiry>;

    private constructor(
        public readonly rest_api_url: URL,
        public readonly relay_url: string,
        public readonly aws_cdn_url: URL,
        public readonly getJwt: func_GetJwt,
        public readonly getNostrSigner: func_GetNostrSigner,
    ) {
        this._getPlaceByOsmRef = getPlaceByOsmRef(rest_api_url);
        this._getPlaces = getPlaces(rest_api_url);
        this.getAccountPlaceRoles = getAccountPlaceRoles(rest_api_url);
        this.getPlaceNotes = getPlaceNotes(rest_api_url);
        this.getPlaceMetrics = getPlaceMetrics(rest_api_url);
        this.getPlaceGallery = getPlaceGallery(rest_api_url);
        this.getPlaceChats = getPlaceChats(rest_api_url);
        this.getPlaceCategoryScores = getPlaceCategoryScores(rest_api_url);
        this.getPlaceEvent = getPlaceEvent(rest_api_url);

        this.getRegion = getRegion(rest_api_url);

        // Calendar Events
        this.getPlaceCalendarEvents = getPlaceCalendarEvents(rest_api_url);
        this.deletePlaceCalendarEvent = deletePlaceCalendarEvent(rest_api_url, getJwt);
        this.postPlaceCalendarEvent = postPlaceCalendarEvent(rest_api_url, getJwt);
        this.postCalendarEventRSVP = postCalendarEventRSVP(rest_api_url, getJwt, getNostrSigner);
        this.postCalendarEventAnnouncement = postCalendarEventAnnouncement(rest_api_url, getJwt);
        this.postCalendarEventNote = postCalendarEventNote(rest_api_url, getJwt);
        this.putUpdateCalendarEvent = putUpdateCalendarEvent(rest_api_url, getJwt);

        // account
        this._getAccount = getAccount(rest_api_url);
        this.getAccountsBySearch = getAccountsBySearch(rest_api_url, getJwt);
        this.createAccount = createAccount(rest_api_url);
        this.updateAccount = updateAccount(rest_api_url, getJwt);
        this.deleteAccount = deleteAccount(rest_api_url, getJwt, getNostrSigner);

        this.getNotesOfPubkey = getNotesOfPubkey(rest_api_url);
        this.getNotes = getNotes(rest_api_url);
        this.getNote = getNote(rest_api_url);
        this.getIpInfo = getIpInfo(rest_api_url);

        // location
        this.getLocationsWithinBoundingBox = getLocationsWithinBoundingBox(rest_api_url);
        this.getLocationReviews = getLocationReviews(rest_api_url);
        this.getLocationByID = getLocation(rest_api_url);
        this.getLocationsByPlaceID = getLocationsByPlaceID(rest_api_url);
        this._claimLocation = claimLocation(rest_api_url, getJwt);
        this.proveLocationClaim = proveLocationClaim(rest_api_url, getJwt, getNostrSigner);
        this.updateLocation = updateLocation(rest_api_url, getJwt);
        this.getAccountsForLocation = getAccountsForLocation(rest_api_url);

        //
        this.addressLookup = addressLookup(rest_api_url);

        // authed APIs
        this.removeAccountRole = removeAccountRole(rest_api_url, this.getJwt, this.getNostrSigner);
        this.addAccountRole = addAccountRole(rest_api_url, this.getJwt, this.getNostrSigner);
        this.updateAccountFollowingList = updateAccountFollowingList(
            rest_api_url,
            this.getJwt,
            this.getNostrSigner,
        );
        this.presign = presign(rest_api_url, getJwt, getNostrSigner);
        this.postReaction = postReaction(rest_api_url, this.getJwt);
        this._postNote = postNote(rest_api_url, this.getJwt);
        this.deleteNote = deleteNote(rest_api_url, this.getJwt);
        this.signEvent = signEvent(rest_api_url, getJwt);
        this.updatePlace = updatePlace(rest_api_url, this.getJwt);

        // sign-in / sign-up
        this.login = login(rest_api_url);
        this.loginNostr = loginNostr(rest_api_url);
        this.initiatePasswordReset = initiatePasswordReset(this.rest_api_url);
        this.resetPassword = resetPassword(this.rest_api_url);
        this.verifyEmail = verifyEmail(this.rest_api_url);
        this.createInterests = createInterests(this.rest_api_url, this.getJwt);
        this.getAccountInterests = getAccountInterests(this.rest_api_url);
        this.getInterests = getInterests(this.rest_api_url);

        //
        this.postAmbassadorInquiry = postAmbassadorInquiry(rest_api_url, getJwt, getNostrSigner);
    }

    static New(args: {
        baseURL: string | URL;
        relay_url: string;
        aws_cdn_url: string | URL;
        getJwt?: () => string;
        getNostrSigner?: func_GetNostrSigner;
    }) {
        const validURL = newURL(args.baseURL);
        if (validURL instanceof Error) {
            return validURL;
        }
        const aws_url = newURL(args.aws_cdn_url);
        if (aws_url instanceof Error) {
            return aws_url;
        }
        if (args.getJwt == undefined) {
            args.getJwt = () => "";
        }
        if (args.getNostrSigner == undefined) {
            args.getNostrSigner = async () => new Error("nostr signer is not provided");
        }
        return new Client(validURL, args.relay_url, aws_url, args.getJwt, args.getNostrSigner);
    }

    // Place
    getPlaces = async (
        args: {
            filters: {
                name: string;
            };
            limit: number;
            page: number;
            sortColumn: "score" | "id" | "price";
            sortDirection: "desc" | "asc";
        },
        options?: { useCache: boolean },
    ) => {
        if (options?.useCache) {
            const results = [];
            for (const place of this.places.values()) {
                if (place.name.includes(args.filters.name)) {
                    results.push(place);
                }
            }
            return results;
        }
        const places = await this._getPlaces(args);
        if (places instanceof Error) {
            return places;
        }
        // set cache
        for (const place of places) {
            this.places.set(place.id, place);
        }
        return places;
    };

    getPlacesMinimal = async (
        args: {
            filters: {
                name: string;
            };
            limit: number;
            page: number;
            sortColumn: "score" | "id" | "price";
            sortDirection: "desc" | "asc";
        },
        options?: { useCache: boolean },
    ) => {
        if (options?.useCache) {
            const results = [];
            for (const place of this.places.values()) {
                if (place.name.includes(args.filters.name)) {
                    results.push(place);
                }
            }
            return results;
        }
        const places = await getPlacesMinimal(this.rest_api_url)(args);
        if (places instanceof Error) {
            return places;
        }
        // set cache
        for (const place of places) {
            this.places.set(place.id, place);
        }
        return places;
    };

    getPlaceByOsmRef = async (args: { osmRef: string | number }, options?: { useCache: boolean }) => {
        if (options?.useCache) {
            const place = this.places.get(args.osmRef);
            if (place) {
                return place;
            }
        }
        const place = await this._getPlaceByOsmRef(args);
        if (place instanceof Error) {
            return place;
        }
        this.places.set(place.id, place);
        return place;
    };

    // Location
    /**
     * @deprecated prefer to .resolver.getLocationByID
     * remove after: 2024/10/10
     */
    getLocation = async (id: number) => {
        return this.resolver.getLocationByID(id);
    };

    /**
     * @deprecated prefer to .getLocationCategories
     * | remove after: 2024/10/10
     */
    getLocationTags = () => {
        return getLocationTags(this.rest_api_url)();
    };

    getLocationCategories = async () => {
        const tags = await this.getLocationTags();
        if (tags instanceof Error) {
            return tags;
        }
        const categories = convertToLocationCategories(tags);
        return categories;
    };

    // Calendar Event
    createCalendarEvent = async (args: {
        description: string;
        placeATag: string;
        calendarEventType: string;
        url: string;
        title: string;
        imageURL: string;
        // todo: use RFC3339 / ISO8601 format
        startDate: Date;
        endDate: Date;
        timezone: string;
        geoHash: string;
        location: string;
        placeId: number;
        summary: string;
    }) => {
        const jwtToken = this.getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const event = await prepareNostrEvent(signer, {
            kind: NostrKind.Calendar_Time,
            content: args.description,
            tags: [
                ["a", args.placeATag],
                ["d", crypto.randomUUID()],
                ["t", args.calendarEventType],
                ["r", args.url],
                ["title", args.title],
                ["image", args.imageURL],
                ["start", Math.floor(args.startDate.getTime() / 1000).toString()],
                ["end", Math.floor(args.endDate.getTime() / 1000).toString()],
                ["start_tzid", args.timezone],
                ["g", args.geoHash],
                ["location", args.location],
                ["summary", args.summary],
                ["url", args.url],
            ],
        });
        if (event instanceof Error) {
            return event;
        }

        const res = await this.postPlaceCalendarEvent({
            placeId: args.placeId,
            event,
        });
        if (res instanceof Error) {
            return res;
        }
        return { postResult: res, event };
    };

    updateCalendarEvent = async (args: {
        calendarEventId: number;
        description: string;
        dTag: string;
        placeATag: string;
        calendarEventType: string;
        url: string;
        title: string;
        imageURL: string;
        // todo: use RFC3339 / ISO8601 format
        startDate: Date;
        endDate: Date;
        timezone: string;
        geoHash: string;
        location: string;
        placeId: number;
        summary: string;
    }) => {
        const jwtToken = this.getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const event = await prepareNostrEvent(signer, {
            kind: NostrKind.Calendar_Time,
            content: args.description,
            tags: [
                ["a", args.placeATag],
                ["d", args.dTag],
                ["t", args.calendarEventType],
                ["r", args.url],
                ["title", args.title],
                ["image", args.imageURL],
                ["start", Math.floor(args.startDate.getTime() / 1000).toString()],
                ["end", Math.floor(args.endDate.getTime() / 1000).toString()],
                ["start_tzid", args.timezone],
                ["g", args.geoHash],
                ["location", args.location],
                ["summary", args.summary],
                ["url", args.url],
            ],
        });
        if (event instanceof Error) {
            return event;
        }

        const res = await this.putUpdateCalendarEvent({
            calendarEventId: args.calendarEventId,
            event,
        });
        if (res instanceof Error) {
            return res;
        }
        return { postResult: res, event };
    };

    createCalendarEventAnnouncement = async (args: {
        calendarEventId: number;
        calendarEventATag: string;
        content: string;
    }) => {
        const jwtToken = this.getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const event = await prepareNostrEvent(signer, {
            kind: NostrKind.TEXT_NOTE,
            content: args.content,
            tags: [["a", args.calendarEventATag]],
        });
        if (event instanceof Error) {
            return event;
        }

        const res = await this.postCalendarEventAnnouncement({
            calendarEventId: args.calendarEventId,
            event,
        });
        if (res instanceof Error) {
            return res;
        }
        return { postResult: res, event };
    };

    createCalendarEventNote = async (args: {
        calendarEventId: number;
        calendarEventATag: string;
        content: string;
    }) => {
        const jwtToken = this.getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const event = await prepareNostrEvent(signer, {
            kind: NostrKind.TEXT_NOTE,
            content: args.content,
            tags: [["a", args.calendarEventATag]],
        });
        if (event instanceof Error) {
            return event;
        }

        const res = await this.postCalendarEventNote({
            calendarEventId: args.calendarEventId,
            event,
        });
        if (res instanceof Error) {
            return res;
        }
        return { postResult: res, event };
    };

    deleteCalendarEvent = async (args: { eventId: string; placeCalendarEventId: number }) => {
        const jwtToken = this.getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const event = await prepareNostrEvent(signer, {
            kind: NostrKind.DELETE,
            tags: [["e", args.eventId]],
            content: "",
        });
        if (event instanceof Error) {
            return event;
        }

        const res = await this.deletePlaceCalendarEvent({
            placeCalendarEventId: args.placeCalendarEventId,
            event,
        });
        if (res instanceof Error) {
            return res;
        }
        return { postResult: res, event };
    };

    // TODO: Depricated method
    async getInterestsOf(pubkey: PublicKey) {
        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }
        const res = await getInterestsOf(relay, pubkey);
        await relay.close();
        return res;
    }

    // TODO: Depricated method
    async publishInterest(interests: Iterable<string>) {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }
        const interest_tags: Tag[] = [];
        for (const interest of interests) {
            interest_tags.push(["t", interest]);
        }
        const event = await prepareNostrEvent(signer, {
            kind: 10015 as NostrKind, // TODO: add to blowater: NostrKind.Interests
            content: "",
            tags: interest_tags,
        });
        if (event instanceof Error) {
            return event;
        }
        const relay = SingleRelayConnection.New(this.relay_url, { log: false });
        if (relay instanceof Error) {
            return relay;
        }
        const res = await relay.sendEvent(event);
        await relay.close();
        if (res instanceof Error) {
            return res;
        }
        return event;
    }

    async updateInterests(interests: Interest[]) {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }
        const interest_tags: Tag[] = [];
        for (const interest of interests) {
            interest_tags.push(["t", interest.name]);
        }
        const event = await prepareNostrEvent(signer, {
            kind: 10015 as NostrKind, // TODO: add to blowater: NostrKind.Interests
            content: "",
            tags: interest_tags,
        });
        if (event instanceof Error) {
            return event;
        }

        return createInterests(this.rest_api_url, this.getJwt)(event, interests);
    }

    /**
     * Checks the availability of a NIP05 address on a given domain.
     */
    checkUsernameAvailability = async (userName: string) => {
        let domain;
        if (this.rest_api_url.host == "api-dev.satlantis.io") {
            domain = "https://dev.satlantis.io";
        } else {
            domain = "https://www.satlantis.io";
        }
        const response = await getPubkeyByNip05({ domain, name: userName });
        if (response instanceof Error) {
            return response;
        }
        if (response == undefined) {
            return true;
        }
        return false;
    };

    /**
     * get following list of the current pubkey
     * @unstable
     */
    getMyFollowingPubkeys = async () => {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }
        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }
        const following = await getFollowingPubkeys(signer.publicKey, relay);
        await relay.close();
        return following;
    };

    followPubkeys = async (toFollow: PublicKey[]) => {
        return followPubkeys(this.relay_url, toFollow, this);
    };

    unfollowPubkey = async (pubkeyToUnfollow: PublicKey) => {
        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }
        {
            const followingKeys = await this.getMyFollowingPubkeys();
            if (followingKeys instanceof Error) {
                return followingKeys;
            }

            // remove pubkey in tags
            followingKeys.delete(pubkeyToUnfollow.hex);
            const tags: Tag[] = Array.from(followingKeys).map((p) => ["p", p]);
            const new_event = await prepareNostrEvent(signer, {
                kind: NostrKind.CONTACTS,
                content: "",
                tags,
            });
            if (new_event instanceof Error) {
                return new_event;
            }

            const err = await relay.sendEvent(new_event);
            if (err instanceof Error) {
                return err;
            }

            const ok = await this.updateAccountFollowingList({ event: new_event });
            if (ok instanceof Error) {
                return ok;
            }
            await relay.close();
            return ok;
        }
    };

    submitAmbassadorApplication = async (args: {
        place: string;
        comment: string;
        email?: string;
        whatsapp?: string;
        telegram?: string;
        nostr_only: boolean;
        satlantis_pubkey: PublicKey;
        countryCode: string;
    }) => {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        let content = "#Ambassador Application\n" + `Place: ${args.place}\n\n` + args.comment + "\n\n";
        if (args.nostr_only) {
            content += "Contact: Nostr Only\n";
        } else if (!args.email && !args.telegram && !args.whatsapp) {
            return new Error("need at least 1 contact method");
        } else {
            if (args.email) {
                content += `Email: ${args.email}\n`;
            }
            if (args.telegram) {
                content += `Telegram: ${args.telegram}\n`;
            }
            if (args.whatsapp) {
                content += `WhatsApp: ${args.whatsapp}\n`;
            }
        }

        const signedEvent = await prepareEncryptedNostrEvent(signer, {
            content,
            kind: NostrKind.DIRECT_MESSAGE,
            algorithm: "nip4",
            tags: [["p", args.satlantis_pubkey.hex]],
            encryptKey: args.satlantis_pubkey,
        });
        if (signedEvent instanceof Error) {
            return signedEvent;
        }

        const err2 = await this.postAmbassadorInquiry({
            countryCode: args.countryCode,
            kind4: signedEvent,
            placeName: args.place,
        });
        if (err2 instanceof Error) {
            return err2;
        }

        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }
        const err = await relay.sendEvent(signedEvent);
        await relay.close();
        if (err instanceof Error) {
            return err;
        }
        return signedEvent;
    };

    uploadFile = async (args: { file: File }) => {
        const res = await this.presign({ filename: args.file.name });
        if (res instanceof Error) {
            return res;
        }

        const response = await safeFetch(res.url, {
            method: "PUT",
            body: args.file,
            headers: {
                "Content-Type": args.file.type,
            },
        });
        if (response instanceof Error) {
            return response;
        }
        const _ = await response.text();
        if (_ instanceof Error) {
            return _;
        }
        const url = newURL(res.url);
        if (url instanceof Error) {
            return url;
        }
        return new URL(url.pathname, this.aws_cdn_url);
    };

    /**
     * @param id
     *      PublicKey: get the user profile by Nostr Public Key
     *
     * @deprecated prefer to .resolver.getUser
     *  all resolver APIs will be moved to .resolve in the future
     * remove after: 2024/10/17
     */
    getUserProfile = async (pubkey: PublicKey | string): Promise<UserResolver | Error> => {
        return this.resolver.getUser(pubkey);
    };

    getMyProfile = async (options?: { useCache: boolean }): Promise<UserResolver | Error> => {
        if (options?.useCache && this.me) {
            return this.me;
        }
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const me = await this.resolver.getUser(signer.publicKey, options);
        if (me instanceof Error) {
            return me;
        }

        this.me = me;
        return me;
    };

    updateMyProfile = async (metaData: Kind0MetaData) => {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        if (this.me == undefined) {
            const currentProfile = await this.resolver.getUser(signer.publicKey);
            if (currentProfile instanceof Error) {
                return currentProfile;
            }
            this.me = currentProfile;
        }

        const kind0 = await prepareKind0(signer, metaData);
        if (kind0 instanceof Error) {
            return kind0;
        }

        this.me.metaData = metaData;
        {
            const res = await this.updateAccount({
                npub: signer.publicKey.bech32(),
                data: {
                    ...metaData,
                    event: kind0,
                },
            });
            if (res instanceof Error) {
                return res;
            }
        }

        return this.me;
    };

    updateMyInterests = async (interests: string[]) => {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const event = await prepareNostrEvent(signer, {
            kind: NostrKind.Interests,
            tags: interests.map((i) => ["t", i]),
            content: "",
        });
        if (event instanceof Error) {
            return event;
        }

        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }
        const err = await relay.sendEvent(event);
        await relay.close();
        if (err instanceof Error) {
            return err;
        }
        if (this.me) {
            this.me.interests = interests;
        }
    };

    claimLocation = async (args: { locationId: number }) => {
        const err = await this.becomeBusinessAccount();
        if (err instanceof Error) {
            return err;
        }
        return this._claimLocation(args);
    };

    private becomeBusinessAccount = async () => {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }
        const kind0 = await prepareKind0(signer, this.me?.metaData || {});
        if (kind0 instanceof Error) {
            return kind0;
        }
        const res = await this.updateAccount({
            npub: signer.publicKey.bech32(),
            data: {
                event: kind0,
                isBusiness: true,
            },
        });
        if (res instanceof Error) {
            return res;
        }
    };

    /**
     * get notes that are created by this pubkey
     *
     * @param args.page.after
     *      get notes after this time
     *      or from the beginning
     *
     * @unstbale
     */
    getNotesOf = async (args: {
        pubkey: PublicKey;
        page: {
            since?: Date;
            until?: Date;
            offset: number;
            limit: number;
        };
    }) => {
        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) return relay;

        const until = Math.floor((Number(args.page.until || 0) || Date.now()) / 1000);
        const since = Math.floor(Number(args.page.since || 0) / 1000) || undefined;

        const sub = await relay.newSub("getNotesOf", {
            kinds: [NostrKind.TEXT_NOTE],
            authors: [args.pubkey.hex],
            limit: args.page.limit,
            since,
            until,
        });
        if (sub instanceof Error) {
            await relay.close();
            return sub;
        }

        async function* get(
            chan: AsyncIterable<RelayResponse_REQ_Message>,
            relay: SingleRelayConnection,
        ) {
            for await (const msg of chan) {
                if (msg.type == "EOSE") {
                    await relay.close();
                    return;
                } else if (msg.type == "EVENT") {
                    yield msg.event;
                } else {
                    console.info(msg);
                }
            }
        }
        return get(sub.chan, relay);
    };

    /**
     * @param args.placeEvent required if posting under a place/city
     *
     * @unstable
     */
    postNote = async (args: { content: string; image: File; placeID?: number }) => {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const uploadedImageUrl = await this.uploadFile({ file: args.image });
        if (uploadedImageUrl instanceof Error) {
            return uploadedImageUrl;
        }

        const fullContent = `${args.content}\n${uploadedImageUrl}`;

        const event = await prepareNostrEvent(signer, {
            kind: NostrKind.TEXT_NOTE,
            content: fullContent,
        });
        if (event instanceof Error) {
            return event;
        }

        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }
        const err = await relay.sendEvent(event);
        await relay.close();
        if (err instanceof Error) {
            return err;
        }

        const res = await this._postNote({
            event,
            noteType: NoteType.MEDIA,
            placeId: args.placeID,
        });
        return res;
    };

    /**
     * reply/comment to an event
     *
     * @unstable
     */
    replyTo = async (args: { event: NostrEvent; content: string }) => {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        // https://github.com/nostr-protocol/nips/blob/master/10.md#marked-e-tags-preferred
        const event = await prepareNostrEvent(signer, {
            kind: NostrKind.TEXT_NOTE,
            content: args.content,
            tags: [["e", args.event.id, this.relay_url, "reply"]],
        });
        if (event instanceof Error) {
            return event;
        }

        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }
        const err = await relay.sendEvent(event);
        await relay.close();
        if (err instanceof Error) {
            return err;
        }

        const res = await this._postNote({
            event,
            noteType: NoteType.BASIC,
        });
        if (res instanceof Error) {
            return res;
        }
    };

    /**
     * only business users/accounts can do it
     *
     * @unstable
     */
    postBusinessGalleryImage = async (args: { image: File }) => {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const me = await this.getMyProfile();
        if (me instanceof Error) {
            return me;
        }
        const isBusiness = await me.getIsBusiness();
        if (isBusiness instanceof Error) {
            return isBusiness;
        }
        if (isBusiness != true) {
            return new Error("you are not a business user");
        }

        const uploadedImageUrl = await this.uploadFile({ file: args.image });
        if (uploadedImageUrl instanceof Error) {
            return uploadedImageUrl;
        }

        const fullContent = `${uploadedImageUrl}`;

        const event = await prepareNostrEvent(signer, {
            kind: NostrKind.TEXT_NOTE,
            content: fullContent,
        });
        if (event instanceof Error) {
            return event;
        }

        const res = await this._postNote({
            event,
            noteType: NoteType.GALLERY,
        });
        return res;
    };

    /**
     * https://github.com/nostr-protocol/nips/blob/master/25.md#reactions
     *
     * @unstable The return type might change
     */
    getLikesOfNote = async (args: { nostrID: string | NoteID }) => {
        if (typeof args.nostrID == "string") {
            args.nostrID = NoteID.FromString(args.nostrID);
        }
        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }

        const stream = await relay.newSub("getLikesOfNote", {
            "#e": [args.nostrID.hex],
            kinds: [NostrKind.REACTION],
        });
        if (stream instanceof Error) {
            await relay.close();
            return stream;
        }
        type x = typeof stream;
        async function* data(s: x) {
            for await (const msg of s.chan) {
                if (msg.type == "EOSE") {
                    return;
                } else if (msg.type == "NOTICE") {
                    console.debug(s.filters, msg.note);
                    continue;
                }
                yield msg.event;
            }
        }
        return data(stream);
    };

    getAccount = async (args: { npub: string }, options?: { useCache: boolean }) => {
        if (options?.useCache) {
            const account = this.accounts.get(args.npub);
            if (account) {
                return account;
            }
        }
        const account = await this._getAccount(args);
        if (account instanceof Error) {
            return account;
        }
        this.accounts.set(args.npub, account);
        return account;
    };

    /**
     * Resolver APIs that provides callers a cleaner relationships among all data types
     * @unstable
     */
    resolver = {
        getUser: async (
            pubkey: PublicKey | string,
            options?: {
                useCache: boolean;
            },
        ): Promise<UserResolver | Error> => {
            if (typeof pubkey == "string") {
                const _pubkey = PublicKey.FromString(pubkey);
                if (_pubkey instanceof Error) {
                    return _pubkey;
                }
                pubkey = _pubkey;
            }

            if (options?.useCache) {
                const user = this.users.get(pubkey.hex);
                if (user) {
                    return user;
                }
            }

            const account = await this.getAccount(
                {
                    npub: pubkey.bech32(),
                },
                options,
            );
            if (account instanceof Error) {
                return account;
            }

            const user = new UserResolver(
                this,
                pubkey,
                account.isAdmin || false,
                account.isBusiness,
                account.nip05,
                {
                    about: account.about,
                    banner: account.banner,
                    displayName: account.displayName,
                    lud06: account.lud06,
                    lud16: account.lud16,
                    name: account.name,
                    picture: account.picture,
                    website: account.website,
                },
            );
            this.users.set(user.pubkey.hex, user);
            return user;
        },

        /**
         * @unstable
         */
        getGlobalFeed: async (args: { page: number; limit: number }) => {
            const me = await this.getNostrSigner();
            if (me instanceof Error) {
                return me;
            }
            const notes = await this.getNotes({
                page: args.page,
                limit: args.limit,
            });
            if (notes instanceof Error) {
                return notes;
            }
            const noteResolvers = [];
            for (const note of notes) {
                const r = new NoteResolver(this, {
                    type: "backend",
                    data: note,
                });
                noteResolvers.push(r);
            }
            return noteResolvers;
        },
        getLocationByID: async (id: number) => {
            const data = await this.getLocationByID({ id });
            if (data instanceof Error) {
                return data;
            }
            return new LocationResolver(this, data);
        },
        getLocationsByPlaceID: async (args: {
            placeID: number;
            search?: string;
            google_rating?: number;
        }) => {
            const locations = await this.getLocationsByPlaceID({
                placeID: args.placeID,
                google_rating: args.google_rating || 0,
                search: args.search,
            });
            if (locations instanceof Error) {
                return locations;
            }
            // for(const location of locations) {}
            return locations.map(
                (l) =>
                    new LocationResolver(this, {
                        address: l.address,
                        bio: l.bio,
                        id: l.id,
                        image: l.image,
                        lat: l.lat,
                        lng: l.lng,
                        locationTags: l.locationTags,
                        name: l.name,
                        openingHours: l.openingHours,
                        // @ts-ignore: missing
                        placeOsmRef: null, // todo: this is missing from backend
                        score: l.score,
                        googleRating: l.googleRating,
                    }),
            );
        },
        /**
         * @unstable
         */
        getOwnerForLocation: async (args: { locationId: number }) => {
            const accounts = await this.getAccountsForLocation({ locationId: args.locationId });
            if (accounts instanceof Error) {
                return accounts;
            }
            // https://linear.app/sat-lantis/issue/SAT-1161/endpoint-getaccountsforlocationlocationid#comment-18c9a50c
            if (accounts.length > 1) {
                console.warn(`more than one owner for the location, locationId: ${args.locationId}`);
            }
            for (const account of accounts) {
                const pubkey = PublicKey.FromHex(account.pubKey);
                if (pubkey instanceof Error) {
                    return pubkey;
                }
                return new UserResolver(
                    this,
                    pubkey,
                    account.isAdmin,
                    account.isBusiness,
                    account.nip05,
                    account,
                );
            }
        },
    };
}

// api
export * from "./api/location.ts";
export * from "./api/login.ts";
export * from "./api/nip5.ts";
export * from "./api/note.ts";
export * from "./api/people.ts";
export * from "./api/place.ts";
export * from "./api/share_types.ts";
export * from "./api/secure/account.ts";
export * from "./api/secure/presign.ts";
export * from "./api/secure/place.ts";
// types
export * from "./models/account.ts";
export * from "./models/calendar.ts";
export * from "./models/chat.ts";
export * from "./models/location.ts";
export * from "./models/metric.ts";
export * from "./models/place.ts";
export * from "./models/region.ts";
export * from "./models/interest.ts";
export * from "./models/reaction.ts";
// data resolvers
export * from "./resolvers/location.ts";
export * from "./resolvers/user.ts";
// nostr helpers
export * from "./event-handling/parser.ts";
export { followPubkeys, getContactList, isUserAFollowingUserB } from "./nostr-helpers.ts";

////////////////////////////////
// Private/Unexported Helpers //
////////////////////////////////
async function prepareKind0(signer: Signer, metadata: Kind0MetaData) {
    return await prepareNostrEvent(signer, {
        content: JSON.stringify(metadata),
        kind: NostrKind.META_DATA,
    });
}

function convertToLocationCategories(locationTags: LocationTag[]): LocationCategory[] {
    const categoryMap = new Map<LocationCategoryName, Map<string, Set<string>>>();

    locationTags.forEach((tag) => {
        const category = tag.category as unknown as LocationCategoryName;
        if (!categoryMap.has(category)) {
            categoryMap.set(category, new Map<string, Set<string>>());
        }

        const subCategoryMap = categoryMap.get(category)!;
        if (!subCategoryMap.has(tag.key)) {
            subCategoryMap.set(tag.key, new Set<string>());
        }

        subCategoryMap.get(tag.key)!.add(tag.value);
    });

    const locationCategories: LocationCategory[] = Array.from(categoryMap.entries()).map(
        ([name, subCategoryMap]): LocationCategory => ({
            name,
            subCategory: Array.from(subCategoryMap.entries()).map(([key, valueSet]) => ({
                key,
                value: Array.from(valueSet),
            })),
        }),
    );

    return locationCategories;
}
