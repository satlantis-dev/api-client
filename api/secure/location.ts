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
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/getGlobalLocations`;

        const { lat, lng, search, page, limit, category, tags } = args;

        if (lat) url.searchParams.set("lat", String(lat));
        if (lng) url.searchParams.set("lng", String(lng));
        if (search) url.searchParams.set("search", search);
        if (page) url.searchParams.set("page", String(page));
        if (limit) url.searchParams.set("limit", String(limit));
        if (category) url.searchParams.set("category", category);
        if (tags?.length) url.searchParams.set("tags", tags.join(","));

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, { headers });

        if (response instanceof Error) {
            return response;
        }

        return handleResponse<LocationDTO[]>(response);
    };
};
