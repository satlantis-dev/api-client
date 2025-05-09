import { ApiError, copyURL, handleResponse } from "../helpers/_helper.ts";
import { Aborted, safeFetch } from "../helpers/safe-fetch.ts";
import {
    type AccountLocationRole,
    AccountLocationRoleType,
    type Location,
    type LocationDTO,
    type LocationGalleryImage,
    type LocationInfo,
    type LocationLink,
    type LocationTag,
} from "../models/location.ts";
import { prepareLocationSetEvent, preparePlaceEvent } from "../nostr-helpers.ts";
import { type func_GetJwt, type func_GetNostrSigner } from "../sdk.ts";

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
    return handleResponse<Location>(response);
};

export const getLocationByGoogleId = (urlArg: URL) => async (args: { googleId: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationByGoogleId/${args.googleId}`;

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Location>(response);
};

// https://github.com/satlantis-dev/api/blob/main/rest/location.go#L67
export const getLocationsByPlaceID = (urlArg: URL, getJwt: func_GetJwt) =>
async (args: {
    placeID: number | null;
    search?: string;
    tag_category?: string;
    tags?: { key: string; value: string }[];
    page?: number;
    limit?: number;
    isSecure?: boolean;
}) => {
    if (args.placeID === null) return [];

    const url = copyURL(urlArg);
    const headers = new Headers();

    if (args.isSecure) {
        const jwt = getJwt();
        if (jwt == "") {
            return new Error("jwt token is empty");
        }
        headers.set("Authorization", `Bearer ${jwt}`);
        url.pathname = `/secure/getLocationsByPlaceID/${args.placeID}`;
    } else {
        url.pathname = `/getLocationsByPlaceID/${args.placeID}`;
    }

    if (args.search) {
        url.searchParams.set("search", String(args.search));
    }
    if (args.tag_category) {
        url.searchParams.set("tag_category", String(args.tag_category));
    }
    if (args.tags && args.tags.length > 0) {
        let tags = "";
        const tagsArray: string[] = [];

        for (const tag of args.tags) {
            tagsArray.push(`${tag.key}=${tag.value}`);
        }

        tags = tagsArray.join(",");
        url.searchParams.set("tags", tags);
    }
    if (args.page) {
        url.searchParams.set("page", String(args.page));
    }
    if (args.limit) {
        url.searchParams.set("limit", String(args.limit));
    }

    const response = await safeFetch(url, { headers });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Location[]>(response);
};

/**
 * @unstable
 * https://github.com/satlantis-dev/api/blob/main/rest/location.go#L144
 */
export const getLocationsWithinBoundingBox = (urlArg: URL, getJwt: func_GetJwt) =>
async (args: {
    sw_lat: number;
    sw_lng: number;
    ne_lat: number;
    ne_lng: number;
    tag_category?: string;
    search?: string;
    tags?: { key: string; value: string }[];
    page?: number;
    limit?: number;
    isSecure?: boolean;
}) => {
    const url = copyURL(urlArg);
    const headers = new Headers();
    if (args.isSecure) {
        const jwt = getJwt();
        if (jwt == "") {
            return new Error("jwt token is empty");
        }
        headers.set("Authorization", `Bearer ${jwt}`);
        url.pathname = `/secure/getLocationsWithinBoundingBox`;
    } else {
        url.pathname = `/getLocationsWithinBoundingBox`;
    }

    let tags = "";
    if (args.tags !== undefined) {
        const tagsArray: string[] = [];

        for (const tag of args.tags) {
            tagsArray.push(`${tag.key}=${tag.value}`);
        }

        tags = tagsArray.join(",");
    }

    url.searchParams.set("sw_lat", String(args.sw_lat));
    url.searchParams.set("sw_lng", String(args.sw_lng));
    url.searchParams.set("ne_lat", String(args.ne_lat));
    url.searchParams.set("ne_lng", String(args.ne_lng));
    if (args.tag_category) {
        url.searchParams.set("tag_category", args.tag_category);
    }
    if (tags) {
        url.searchParams.set("tags", tags);
    }
    if (args.search) {
        url.searchParams.set("search", args.search);
    }
    if (args.limit) {
        url.searchParams.set("limit", String(args.limit));
    }
    if (args.page) {
        url.searchParams.set("page", String(args.page));
    }

    const response = await safeFetch(url, { headers });
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

export const suggestLocation = (urlArg: URL, getJwt: func_GetJwt) => async (args: { data: any }) => {
    const jwt = getJwt();
    if (jwt == "") {
        return new Error("jwt token is empty");
    }
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwt}`);

    const url = copyURL(urlArg);
    url.pathname = `/secure/suggestLocation`;

    const response = await safeFetch(url, {
        headers,
        method: "POST",
        body: JSON.stringify(args.data),
    });
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
export const proveLocationClaim =
    (urlArg: URL, getJwt: func_GetJwt, getSigner: func_GetNostrSigner) =>
    async (args: {
        locationId: number;
        url: string;
        referredBy: string;
    }) => {
        const jwt = getJwt();
        if (jwt == "") {
            return new Error("jwt token is empty");
        }
        const signer = await getSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const event = await prepareLocationSetEvent(signer);
        if (event instanceof Error) {
            return event;
        }

        const event2 = await preparePlaceEvent(signer, { placeName: "" });
        if (event instanceof Error) {
            return event;
        }

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwt}`);

        const url = copyURL(urlArg);
        url.pathname = `/secure/proveLocationClaim/${args.locationId}`;

        const body = JSON.stringify({
            url: args.url,
            referredBy: args.referredBy,
            locationSetEvent: event,
            placeEvent: event2,
        });
        const response = await safeFetch(url, {
            method: "POST",
            headers,
            body,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse(response);
    };

// https://github.com/satlantis-dev/api/blob/46ec43557c194691fe62c5693ae4a9facd878702/rest/location.go#L1144
export const updateLocation = (urlArg: URL, getJwt: func_GetJwt) =>
async (args: {
    locationId: number;
    location: LocationInfo;
}) => {
    const jwt = getJwt();
    if (jwt == "") {
        return new Error("jwt token is empty");
    }
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwt}`);

    const url = copyURL(urlArg);
    url.pathname = `/secure/updateLocation/${args.locationId}`;

    const body = JSON.stringify(args.location);

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
        body,
    });
    if (response instanceof Error) {
        return response;
    }
    // The response is not in JSON format.
    // https://linear.app/sat-lantis/issue/SAT-950/be-edit-location#comment-824937ba
    const res_text = await response.text();
    if (res_text instanceof Aborted) {
        return body;
    }
    if (response.status != 200) {
        return new ApiError(response.status, res_text);
    }
    return res_text;
};

export const getAccountsForLocation = (urlArg: URL) =>
async (args: {
    locationId: number;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getAccountsForLocation/${args.locationId}`;

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        readonly id: number;
        readonly about: string;
        readonly isAdmin: boolean;
        readonly isBusiness: boolean;
        readonly name: string;
        readonly nip05: string;
        readonly npub: string;
        readonly picture: string;
        readonly pubKey: string;
    }[]>(response);
};

/**
 * GET /getLocationGalleryImages/:locationId
 */
export const getLocationGalleryImages = (urlArg: URL) =>
async (args: {
    locationId: number;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationGalleryImages/${args.locationId}`;

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<LocationGalleryImage[]>(response);
};

/**
 * GET /getLocationsBySearch
 * https://github.com/satlantis-dev/api/blob/dev/rest/location.go#L203
 */
export const getLocationsBySearch = (urlArg: URL) =>
async (args: {
    rating: number;
    search?: string;
    tag_category?: string;
    place_id?: number;
    limit?: number;
    page?: number;
    sortColumn?: string;
    sortDirection?: "asc" | "desc";
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationsBySearch`;
    url.searchParams.set("rating", String(args.rating));
    if (args.search) {
        url.searchParams.set("search", args.search);
    }
    if (args.tag_category) {
        url.searchParams.set("tag_category", args.tag_category);
    }
    if (args.place_id) {
        url.searchParams.set("place_id", String(args.place_id));
    }
    if (args.sortColumn) {
        url.searchParams.set("sortColumn", args.sortColumn);
    }
    if (args.sortDirection) {
        url.searchParams.set("sortDirection", args.sortDirection);
    }
    if (args.limit) {
        url.searchParams.set("limit", String(args.limit));
    }
    if (args.page) {
        url.searchParams.set("page", String(args.page));
    }
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<LocationDTO[]>(response);
};

/**
 * GET /getLocationsByPlaceIDRandomized/{placeId}
 * https://github.com/satlantis-dev/api/blob/dev/rest/location.go#L105
 */
export const getLocationsByPlaceIDRandomized = (urlArg: URL) =>
async (args: {
    placeId: number;
    tags?: { key: string; value: string }[];
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationsByPlaceIDRandomized/${args.placeId}`;

    if (args.tags) {
        const tagsArray: string[] = [];
        for (const tag of args.tags) {
            tagsArray.push(`${tag.key}=${tag.value}`);
        }
        url.searchParams.set("tags", tagsArray.join(","));
    }

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<LocationDTO[]>(response);
};

/**
 * GET /getLocationLinks/{locationId}
 * https://github.com/satlantis-dev/api/blob/dev/rest/location.go#L883
 */
export const getLocationLinks = (urlArg: URL) =>
async (args: {
    locationId: number;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationLinks/${args.locationId}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<LocationLink[]>(response);
};

/**
 * GET /accountRolesForLocation/{locationId}
 * https://github.com/satlantis-dev/api/blob/prod/rest/account_location_role.go#L34
 */
export const getAccountRolesForLocation = (urlArg: URL) =>
async (args: {
    locationId: number;
    type: AccountLocationRoleType;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/accountRolesForLocation/${args.locationId}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<AccountLocationRole[]>(response);
};
