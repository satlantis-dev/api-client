import { newURL } from "./_helper.ts";
import { deleteAccountRole } from "./api/account.ts";
import { getPlaceEvent, this_is_a_new_API } from "./api/event.ts";
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
    deleteAccountRole: ReturnType<typeof deleteAccountRole> | (() => Error);
    loginNostr: ReturnType<typeof loginNostr>;
    this_is_a_new_API: ReturnType<typeof this_is_a_new_API>;

    private constructor(
        public readonly url: URL,
        public readonly jwtToken: string | undefined,
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
        this.this_is_a_new_API = this_is_a_new_API(url);

        if (this.jwtToken) {
            this.deleteAccountRole = deleteAccountRole(url, this.jwtToken);
        } else {
            this.deleteAccountRole = () => {
                return new Error("No jwt token is provided to the client");
            };
        }
    }

    static New(args: { baseURL: string | URL; jwtToken?: string }) {
        const validURL = newURL(args.baseURL);
        if (validURL instanceof Error) {
            return validURL;
        }
        return new Client(validURL, args.jwtToken);
    }
}

export * from "./api/place.ts";
export * from "./api/share_types.ts";
