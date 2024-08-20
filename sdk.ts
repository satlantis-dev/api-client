import { type Signer } from "@blowater/nostr-sdk";

import { getAccount } from "./api/account.ts";
import { getIpInfo } from "./api/ip.ts";
import { getLocationsWithinBoundingBox, getLocationTags } from "./api/location.ts";
import { loginNostr } from "./api/login.ts";
import { getNote, getNotes } from "./api/note.ts";
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
import { addAccountRole, removeAccountRole, updateAccountFollowingList } from "./api/secure/account.ts";
import { updatePlace } from "./api/secure/place.ts";
import { postNote, postReaction } from "./api/secure/note.ts";
import { presign } from "./api/secure/presign.ts";
import { newURL } from "./helpers/_helper.ts";

export type func_GetNostrSigner = () => Promise<Signer | Error>;

export class Client {
    getAccountPlaceRoles: ReturnType<typeof getAccountPlaceRoles>;
    getPlace: ReturnType<typeof getPlace>;
    getPlaces: ReturnType<typeof getPlaces>;
    getPlaceEvent: ReturnType<typeof getPlaceEvent>;
    getPlaceNoteFeed: ReturnType<typeof getPlaceNoteFeed>;
    getPlaceMetrics: ReturnType<typeof getPlaceMetrics>;
    getPlaceGallery: ReturnType<typeof getPlaceGallery>;
    getPlaceCalendarEvents: ReturnType<typeof getPlaceCalendarEvents>;
    getPlaceChats: ReturnType<typeof getPlaceChats>;
    getPlaceCategoryScores: ReturnType<typeof getPlaceCategoryScores>;
    getLocationsWithinBoundingBox: ReturnType<
        typeof getLocationsWithinBoundingBox
    >;
    getRegion: ReturnType<typeof getRegion>;
    getAccount: ReturnType<typeof getAccount>;
    getNotes: ReturnType<typeof getNotes>;
    getNote: ReturnType<typeof getNote>;
    getIpInfo: ReturnType<typeof getIpInfo>;

    // auth
    loginNostr: ReturnType<typeof loginNostr>;
    /////////////////
    // authed APIs //
    /////////////////
    // acount role
    removeAccountRole: ReturnType<typeof removeAccountRole>;
    addAccountRole: ReturnType<typeof addAccountRole>;
    updateAccountFollowingList: ReturnType<typeof updateAccountFollowingList>;

    // nostr note
    postNote: ReturnType<typeof postNote>;
    postReaction: ReturnType<typeof postReaction>;

    // s3
    presign: ReturnType<typeof presign>;

    // place
    updatePlace: ReturnType<typeof updatePlace>;

    private constructor(
        public readonly url: URL,
        public readonly getJwt: () => string,
        public readonly getNostrSigner: func_GetNostrSigner,
    ) {
        this.getPlace = getPlace(url);
        this.getPlaces = getPlaces(url);
        this.getAccountPlaceRoles = getAccountPlaceRoles(url);
        this.getPlaceNoteFeed = getPlaceNoteFeed(url);
        this.getPlaceMetrics = getPlaceMetrics(url);
        this.getPlaceGallery = getPlaceGallery(url);
        this.getPlaceCalendarEvents = getPlaceCalendarEvents(url);
        this.getPlaceChats = getPlaceChats(url);
        this.getPlaceCategoryScores = getPlaceCategoryScores(url);
        this.getPlaceEvent = getPlaceEvent(url);
        this.getLocationsWithinBoundingBox = getLocationsWithinBoundingBox(url);
        this.getRegion = getRegion(url);
        this.loginNostr = loginNostr(url);
        this.getAccount = getAccount(url);
        this.getNotes = getNotes(url);
        this.getNote = getNote(url);
        this.getIpInfo = getIpInfo(url);

        // authed APIs
        this.removeAccountRole = removeAccountRole(
            url,
            this.getJwt,
            this.getNostrSigner,
        );
        this.addAccountRole = addAccountRole(
            url,
            this.getJwt,
            this.getNostrSigner,
        );
        this.updateAccountFollowingList = updateAccountFollowingList(url, this.getJwt, this.getNostrSigner);
        this.presign = presign(url, this.getJwt);
        this.postReaction = postReaction(url, this.getJwt);
        this.postNote = postNote(url, this.getJwt);
        this.updatePlace = updatePlace(url, this.getJwt);
    }

    static New(args: {
        baseURL: string | URL;
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
        return new Client(validURL, args.getJwt, args.getNostrSigner);
    }

    getLocationTags = () => {
        return getLocationTags(this.url)();
    };
}

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
export * from "./models/account.ts";
export * from "./models/calendar.ts";
export * from "./models/chat.ts";
export * from "./models/location.ts";
export * from "./models/metric.ts";
export * from "./models/place.ts";
export * from "./models/region.ts";
