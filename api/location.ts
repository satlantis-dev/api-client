import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Location, LocationByID, LocationTag } from "../models/location.ts";
import type { Address, func_GetJwt, OpeningHours } from "../sdk.ts";

export const getLocationTags = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationTags`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<LocationTag[]>(response);
};

export const getLocation = (urlArg: URL) => async (args: { id: number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocation/${args.id}`;

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<LocationByID>(response);
};

export const getLocationsByPlaceID = (urlArg: URL) =>
async (args: {
    placeID: number;
    search?: string;
    // https://github.com/satlantis-dev/api/blob/2582005a5fe23c6d4d10c71c68cc72c4088f3ed1/database/location.go#L157
    // sortDirection?: 'desc' | 'asc';
    // todo: having this field mandatory is not a good design, should change the backend
    google_rating: number;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationsByPlaceID/${args.placeID}`;
    url.searchParams.set("google_rating", String(args.google_rating));

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<LocationByPlace[]>(response);
};

/**
 * @unstable
 * @param tags currently tags are not used
 */
export const getLocationsWithinBoundingBox = (urlArg: URL) =>
async (args: {
    sw_lat: number;
    sw_lng: number;
    ne_lat: number;
    ne_lng: number;
    google_rating: number;
    search?: string;
    tag_category?: string;
    tags?: LocationTag[];
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationsWithinBoundingBox`;

    let tags = "";
    if (args.tags !== undefined) {
        const tagsArray: string[] = [];

        for (const tag of args.tags) {
            tagsArray.push(`${tag.key}-${tag.value}`);
        }

        tags = tagsArray.join(",");
    }

    url.searchParams.set("sw_lat", String(args.sw_lat));
    url.searchParams.set("sw_lng", String(args.sw_lng));
    url.searchParams.set("ne_lat", String(args.ne_lat));
    url.searchParams.set("ne_lng", String(args.ne_lng));
    url.searchParams.set("google_rating", String(args.google_rating));
    if (args.tag_category) {
        url.searchParams.set("tag_category", args.tag_category);
    }
    if (tags) {
        url.searchParams.set("tags", tags);
    }
    if (args.search) {
        url.searchParams.set("search", args.search);
    }

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    const x = await handleResponse<Location[]>(response);
    return x;
};

// Get location reviews
export const getLocationReviews = (urlArg: URL) =>
async (args: {
    locationId: number;
    limit: number;
    page: number;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationReviews/${args.locationId}`;
    url.searchParams.append("limit", JSON.stringify(args.limit));
    url.searchParams.append("page", JSON.stringify(args.page));

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse(response);
};

export const claimLocation = (urlArg: URL, getJwt: func_GetJwt) =>
async (args: {
    locationId: number;
}) => {
    const jwt = getJwt();
    if (jwt == "") {
        return new Error("jwt token is empty");
    }
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwt}`);

    const url = copyURL(urlArg);
    url.pathname = `/secure/claimLocation/${args.locationId}`;

    const response = await safeFetch(url, { headers });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ code: string }>(response);
};

/**
type ProveLocationClaimRequest struct {
	Url              string       `json:"url"`
	ReferredBy       string       `json:"referredBy"`
	LocationSetEvent *nostr.Event `json:"locationSetEvent"`
	PlaceEvent       *nostr.Event `json:"placeEvent"`
}
 */
export const proveLocationClaim = (urlArg: URL, getJwt: func_GetJwt) =>
async (args: {
    locationId: number;
    url: string;
    referredBy: string;
}) => {
    const jwt = getJwt();
    if (jwt == "") {
        return new Error("jwt token is empty");
    }
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwt}`);

    const url = copyURL(urlArg);
    url.pathname = `/secure/proveLocationClaim/${args.locationId}`;

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
            url: args.url,
            referredBy: args.referredBy,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse(response);
};

type LocationByPlace = {
    readonly id: number;
    readonly accounts: null;
    readonly address: Address;
    readonly bio: null;
    readonly businessStatus: BusinessStatus;
    readonly eventId: number;
    readonly event: Event;
    readonly googleId: string;
    readonly googleMapsUrl: string;
    readonly googleRating: number;
    readonly googleUserRatingCount: number;
    readonly image: string;
    readonly isClaimed: boolean;
    readonly lat: number;
    readonly lng: number;
    readonly locationTags: LocationTag[];
    readonly placeId: number;
    readonly name: string;
    // todo: the frontend does not use this field, should remove in the backend API
    // readonly notes:                 NoteElement[];
    readonly openingHours: OpeningHours;
    readonly osmRef: string;
    readonly phone: string;
    readonly priceLevel: PriceLevel;
    readonly score: number;
    readonly websiteUrl: string;
    readonly email: string;
};

type BusinessStatus = "OPERATIONAL";

type PriceLevel = "PRICE_LEVEL_MODERATE" | "PRICE_LEVEL_INEXPENSIVE" | "PRICE_LEVEL_UNSPECIFIED";
