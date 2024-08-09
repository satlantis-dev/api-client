import { Signer } from "@blowater/nostr-sdk";
import { newURL } from "./helpers/_helper.ts";
import { deleteAccountRole, postAccountRole } from "./api/secure/account.ts";
import { getPlaceEvent } from "./api/event.ts";
import { loginNostr } from "./api/login.ts";
import { getAccountPlaceRoles } from "./api/people.ts";
import {
    getLocationsWithinBoundingBox,
    getPlace,
    getPlaceCalendarEvents,
    getPlaceCategoryScores,
    getPlaceChats,
    getPlaceGallery,
    getPlaceMetrics,
    getPlaceNoteFeed,
    getRegion,
} from "./api/place.ts";
import { presign } from "./api/secure/presign.ts";

export class Client {
    getAccountPlaceRoles: ReturnType<typeof getAccountPlaceRoles>;
    getPlace: ReturnType<typeof getPlace>;
    getPlaceEvent: ReturnType<typeof getPlaceEvent>;
    getPlaceNoteFeed: ReturnType<typeof getPlaceNoteFeed>;
    getPlaceMetrics: ReturnType<typeof getPlaceMetrics>;
    getPlaceGallery: ReturnType<typeof getPlaceGallery>;
    getPlaceCalendarEvents: ReturnType<typeof getPlaceCalendarEvents>;
    getPlaceChats: ReturnType<typeof getPlaceChats>;
    getPlaceCategoryScores: ReturnType<typeof getPlaceCategoryScores>;
    getLocationsWithinBoundingBox: ReturnType<typeof getLocationsWithinBoundingBox>;
    getRegion: ReturnType<typeof getRegion>;

    // auth
    loginNostr: ReturnType<typeof loginNostr>;
    /////////////////
    // authed APIs //
    /////////////////
    // acount role
    deleteAccountRole: ReturnType<typeof deleteAccountRole>;
    postAccountRole: ReturnType<typeof postAccountRole>;

    // s3
    presign: ReturnType<typeof presign>;

    private constructor(
        public readonly url: URL,
        public readonly jwtToken: string | undefined,
        public readonly getNostrSigner: undefined | (() => Signer | Error),
    ) {
        this.getPlace = getPlace(url);
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

        // authed APIs
        this.deleteAccountRole = deleteAccountRole(
            url,
            this.jwtToken,
            this.getNostrSigner || (() => new Error("nostr signer is not provided")),
        );
        this.postAccountRole = postAccountRole(
            url,
            this.jwtToken,
            this.getNostrSigner || (() => new Error("nostr signer is not provided")),
        );
        this.presign = presign(url, jwtToken);
    }

    static New(args: {
        baseURL: string | URL;
        jwtToken?: string;
        getNostrSigner?: () => Signer | Error;
    }) {
        const validURL = newURL(args.baseURL);
        if (validURL instanceof Error) {
            return validURL;
        }
        return new Client(validURL, args.jwtToken, args.getNostrSigner);
    }
}

export * from "./api/place.ts";
export * from "./api/share_types.ts";
