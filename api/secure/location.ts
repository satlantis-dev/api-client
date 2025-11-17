import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { ImageCategory, LocationDTO, LocationGalleryImage } from "../../models/location.ts";

/**
 * POST /secure/postLocationGalleryImage
 * Roles with permission: Admin and some other roles(see the backend)
 * @returns id of the new image
 * https://github.com/satlantis-dev/api/blob/dev/rest/location_gallery.go
 */
export const postLocationGalleryImage = (urlArg: URL, getJwt: () => string) =>
async (args: {
    locationID: number;
    url: string;
    source: string;
    category: ImageCategory;
    highlight: boolean;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/postLocationGalleryImage`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "POST",
        body: JSON.stringify(args),
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<string>(response);
};

/**
 * PUT /secure/updateLocationGalleryImage/{id}
 * Roles with permission: Admin and some other roles(see the backend)
 * @returns nothing
 * https://github.com/satlantis-dev/api/blob/dev/rest/location_gallery.go
 */
export const updateLocationGalleryImage = (urlArg: URL, getJwt: () => string) =>
async (
    args: {
        imageId: number;
        image: Partial<LocationGalleryImage>;
    },
) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/updateLocationGalleryImage/${args.imageId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "PUT",
        body: JSON.stringify(args.image),
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    // @ts-ignore TODO: handleResponse gotta be re-typed at some point.
    return handleResponse<null>(response);
};

/**
 * DELETE /secure/deleteLocationGalleryImage/{id}
 * Roles with permission: Admin and some other roles(see the backend)
 * @returns nothing
 * https://github.com/satlantis-dev/api/blob/dev/rest/location_gallery.go
 */
export const deleteLocationGalleryImage =
    (urlArg: URL, getJwt: () => string) => async (args: { id: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/deleteLocationGalleryImage/${args.id}`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<string>(response);
    };

/**
 * DELETE /secure/promoteLocationGalleryImageToBanner/{id}
 * Roles with permission: Admin and some other roles(see the backend)
 * @returns nothing
 * https://github.com/satlantis-dev/api/blob/dev/rest/location_gallery.go
 */
export const promoteLocationGalleryImageToBanner =
    (urlArg: URL, getJwt: () => string) => async (args: { imageId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }
        const url = copyURL(urlArg);
        url.pathname = `/secure/promoteLocationGalleryImageToBanner/${args.imageId}`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        const response = await safeFetch(url, {
            method: "PUT",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        // @ts-ignore TODO: handleResponse gotta be re-typed at some point.
        return handleResponse<null>(response);
    };

/**
 * GET /secure//getRecommendedLocations/{placeId}
 * @returns Has been shuffled in BE.
 * https://github.com/satlantis-dev/api/blob/prod/rest/location.go#L163
 */
export const getRecommendedLocations =
    (urlArg: URL, getJwt: () => string) => async (args: { placeId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/getRecommendedLocations/${args.placeId}`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<LocationDTO[]>(response);
    };

export const getRecommendedLocationsGlobal = (urlArg: URL, getJwt: () => string) => async () => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/getRecommendedLocationsGlobal`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<LocationDTO[]>(response);
};

export const getRecommendedPlaces =
    (urlArg: URL, getJwt: () => string) => async (args: { placeId?: number | null } | undefined) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = args?.placeId
            ? `/secure/destination/${args.placeId}/places/recommended`
            : `/secure/places/recommended`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<LocationDTO[]>(response);
    };

export type GetRandomizedPlacesArgs = {
    placeId?: number;
    category?: string;
    tags?: string[];
};

export const getRandomizedPlaces = (urlArg: URL) => async (args?: GetRandomizedPlacesArgs) => {
    const url = copyURL(urlArg);
    url.pathname = args?.placeId ? `/destination/${args.placeId}/places/randomized` : `/places/randomized`;

    if (args?.category) url.searchParams.set("category", args.category);
    if (args?.tags?.length) url.searchParams.set("tags", args.tags.join(","));

    const headers = new Headers();

    const response = await safeFetch(url, {
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<LocationDTO[]>(response);
};

export type LocationReportType = "Remove" | "Closed" | "MissingInfo" | "WrongInfo" | "Duplicate";

export const reportLocation = (urlArg: URL, getJwt: () => string) =>
async (args: {
    locationId: number;
    comment: string;
    reportType: LocationReportType;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/place/${args.locationId}/report`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "PUT",
        body: JSON.stringify({
            comment: args.comment,
            reportType: args.reportType,
        }),
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ success: boolean }>(response);
};

export const getNewestPlaces = (urlArg: URL) => async (args: { placeId?: number | null } | undefined) => {
    const url = copyURL(urlArg);
    url.pathname = args?.placeId ? `/destination/${args.placeId}/places/newest` : `/places/newest`;

    const headers = new Headers();

    const response = await safeFetch(url, {
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<LocationDTO[]>(response);
};

export type GetGlobalLocationsArgs = {
    lat?: number;
    lng?: number;
    search: string;
    page?: number;
    limit?: number;
    category?: string;
    tags?: string[];
};

export const getGlobalLocations = (urlArg: URL, getJwt: () => string) => {
    return async (args: GetGlobalLocationsArgs) => {
        const jwtToken = getJwt();

        const url = copyURL(urlArg);
        url.pathname = `/places/global`;

        const { lat, lng, search, page, limit, category, tags } = args;

        if (lat) url.searchParams.set("lat", String(lat));
        if (lng) url.searchParams.set("lng", String(lng));
        if (search) url.searchParams.set("search", search);
        if (page) url.searchParams.set("page", String(page));
        if (limit) url.searchParams.set("limit", String(limit));
        if (category) url.searchParams.set("category", category);
        if (tags?.length) url.searchParams.set("tags", tags.join(","));

        const headers = new Headers();
        if (jwtToken == "") {
          headers.set("Authorization", `Bearer ${jwtToken}`);
        }

        const response = await safeFetch(url, { headers });

        if (response instanceof Error) {
            return response;
        }

        return handleResponse<LocationDTO[]>(response);
    };
};
