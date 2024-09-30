import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Location, LocationTag } from "../models/location.ts";
import type { func_GetJwt } from "../sdk.ts";

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
    return handleResponse<{
        id: number;
        bio: string | null;
        image: string;
        lat: number;
        lng: number;
        locationTags: LocationTag[] | null;
        name: string;
        placeOsmRef: string;
        score: number;
    }>(response);
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
