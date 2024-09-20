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

import {
    createAccount,
    getAccount,
    initiatePasswordReset,
    login,
    resetPassword,
    verifyEmail,
} from "./api/account.ts";
import { getIpInfo } from "./api/ip.ts";
import { getLocationReviews, getLocationsWithinBoundingBox, getLocationTags } from "./api/location.ts";
import { loginNostr } from "./api/login.ts";
import { getNote, getNotes, NoteType } from "./api/note.ts";
import { getAccountPlaceRoles } from "./api/people.ts";
import {
    getPlace,
    getPlaceCalendarEvents,
    getPlaceCategoryScores,
    getPlaceChats,
    getPlaceEvent,
    getPlaceGallery,
    getPlaceMetrics,
    getPlaceNoteFeed,
    getPlaces,
    getRegion,
} from "./api/place.ts";
import {
    addAccountRole,
    removeAccountRole,
    updateAccount,
    updateAccountFollowingList,
} from "./api/secure/account.ts";
import { updatePlace } from "./api/secure/place.ts";
import { postNote, postReaction } from "./api/secure/note.ts";
import { presign } from "./api/secure/presign.ts";
import { newURL } from "./helpers/_helper.ts";
import { addressLookup } from "./api/address.ts";
import { signEvent } from "./api/nostr_event.ts";
import { getInterests } from "./api/secure/interests.ts";
import { postCalendarEventRSVP } from "./api/secure/calendar.ts";
import type { CalendarEventType } from "./models/calendar.ts";
import { Hashtag } from "./api/calendar.ts";
import { getInterestsOf } from "./nostr-helpers.ts";
import { getPubkeyByNip05 } from "./api/nip5.ts";

export type func_GetNostrSigner = () => Promise<Signer | Error>;
export type func_GetJwt = () => string;

export class Client {
    // Place
    getAccountPlaceRoles: ReturnType<typeof getAccountPlaceRoles>;
    getPlace: ReturnType<typeof getPlace>;
    getPlaces: ReturnType<typeof getPlaces>;
    getPlaceEvent: ReturnType<typeof getPlaceEvent>;
    getPlaceNoteFeed: ReturnType<typeof getPlaceNoteFeed>;
    getPlaceMetrics: ReturnType<typeof getPlaceMetrics>;
    getPlaceGallery: ReturnType<typeof getPlaceGallery>;
    getPlaceChats: ReturnType<typeof getPlaceChats>;
    getPlaceCategoryScores: ReturnType<typeof getPlaceCategoryScores>;
    getLocationsWithinBoundingBox: ReturnType<typeof getLocationsWithinBoundingBox>;
    getRegion: ReturnType<typeof getRegion>;

    // Calendar Events
    getPlaceCalendarEvents: ReturnType<typeof getPlaceCalendarEvents>;
    postCalendarEventRSVP: ReturnType<typeof postCalendarEventRSVP>;

    // Account
    getAccount: ReturnType<typeof getAccount>;
    createAccount: ReturnType<typeof createAccount>;
    updateAccount: ReturnType<typeof updateAccount>;

    getNotes: ReturnType<typeof getNotes>;
    getNote: ReturnType<typeof getNote>;
    getIpInfo: ReturnType<typeof getIpInfo>;
    getLocationReviews: ReturnType<typeof getLocationReviews>;
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
    updateAccountFollowingList: ReturnType<typeof updateAccountFollowingList>;
    getInterests: ReturnType<typeof getInterests>;

    // nostr note
    postNote: ReturnType<typeof postNote>;
    postReaction: ReturnType<typeof postReaction>;
    signEvent: ReturnType<typeof signEvent>;

    // s3
    presign: ReturnType<typeof presign>;

    // place
    updatePlace: ReturnType<typeof updatePlace>;

    private constructor(
        public readonly url: URL,
        public readonly relay_url: string,
        public readonly getJwt: func_GetJwt,
        public readonly getNostrSigner: func_GetNostrSigner,
    ) {
        this.getPlace = getPlace(url);
        this.getPlaces = getPlaces(url);
        this.getAccountPlaceRoles = getAccountPlaceRoles(url);
        this.getPlaceNoteFeed = getPlaceNoteFeed(url);
        this.getPlaceMetrics = getPlaceMetrics(url);
        this.getPlaceGallery = getPlaceGallery(url);
        this.getPlaceChats = getPlaceChats(url);
        this.getPlaceCategoryScores = getPlaceCategoryScores(url);
        this.getPlaceEvent = getPlaceEvent(url);
        this.getLocationsWithinBoundingBox = getLocationsWithinBoundingBox(url);
        this.getRegion = getRegion(url);

        // Calendar Events
        this.getPlaceCalendarEvents = getPlaceCalendarEvents(url);
        this.postCalendarEventRSVP = postCalendarEventRSVP(url, getJwt, getNostrSigner);

        this.getAccount = getAccount(url);
        this.createAccount = createAccount(url);
        this.updateAccount = updateAccount(url, getJwt);

        this.getNotes = getNotes(url);
        this.getNote = getNote(url);
        this.getIpInfo = getIpInfo(url);
        this.getLocationReviews = getLocationReviews(url);
        this.addressLookup = addressLookup(url);

        // authed APIs
        this.removeAccountRole = removeAccountRole(url, this.getJwt, this.getNostrSigner);
        this.addAccountRole = addAccountRole(url, this.getJwt, this.getNostrSigner);
        this.updateAccountFollowingList = updateAccountFollowingList(
            url,
            this.getJwt,
            this.getNostrSigner,
        );
        this.presign = presign(url, this.getJwt);
        this.postReaction = postReaction(url, this.getJwt);
        this.postNote = postNote(url, this.getJwt);
        this.signEvent = signEvent(url, getJwt);
        this.updatePlace = updatePlace(url, this.getJwt);

        // sign-in / sign-up
        this.login = login(url);
        this.loginNostr = loginNostr(url);
        this.initiatePasswordReset = initiatePasswordReset(this.url);
        this.resetPassword = resetPassword(this.url);
        this.verifyEmail = verifyEmail(this.url);
        this.getInterests = getInterests(this.url);
    }

    static New(args: {
        baseURL: string | URL;
        relay_url: string;
        getJwt?: () => string;
        getNostrSigner?: func_GetNostrSigner;
    }) {
        const validURL = newURL(args.baseURL);
        if (validURL instanceof Error) {
            return validURL;
        }
        if (args.getJwt == undefined) {
            args.getJwt = () => "";
        }
        if (args.getNostrSigner == undefined) {
            args.getNostrSigner = async () => new Error("nostr signer is not provided");
        }
        return new Client(validURL, args.relay_url, args.getJwt, args.getNostrSigner);
    }

    getLocationTags = () => {
        return getLocationTags(this.url)();
    };

    createCalendarEvent = async (args: {
        description: string;
        placeATag: string;
        calendarEventType: CalendarEventType;
        url: string;
        title: string;
        imageURL: string;
        // todo: use RFC3339 / ISO8601 format
        startDate: string;
        endDate: string;
        timezone: string;
        geoHash: string;
        location: string;
        placeID?: number;
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
                ["t", Hashtag(args.calendarEventType)],
                ["r", args.url],
                ["title", args.title],
                ["image", args.imageURL],
                ["start", Math.floor(new Date(args.startDate).getTime() / 1000).toString()],
                ["end", Math.floor(new Date(args.endDate).getTime() / 1000).toString()],
                ["start_tzid", args.timezone],
                ["g", args.geoHash],
                ["location", args.location],
            ],
        });
        if (event instanceof Error) {
            return event;
        }

        const res = await this.postNote({
            placeId: args.placeID,
            event,
            noteType: NoteType.CALENDAR_EVENT,
        });
        if (res instanceof Error) {
            return res;
        }
        return { postResult: res, event };
    };

    async getInterestsOf(pubkey: PublicKey) {
        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }
        const res = await getInterestsOf(relay, pubkey);
        await relay.close();
        return res;
    }

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
            kind: NostrKind.Interests,
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

    /**
     * Checks the availability of a NIP05 address on a given domain.
     */
    checkUsernameAvailability = async (userName: string) => {
        let domain;
        if (this.url.host == "api-dev.satlantis.io") {
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
}

// api
export * from "./api/calendar.ts";
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
// nostr helpers
export * from "./event-handling/parser.ts";
export * from "./nostr-helpers.ts";
