import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { BoundingBox, Place } from "../../models/place.ts";

export const updatePlace = (urlArg: URL, getJwt: () => string) => async (place: Partial<Place>) => {
    if (!place.id) {
        return new Error("place id is empty");
    }

    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/destination/${place.id}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "PUT",
        body: JSON.stringify(place),
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Place>(response);
};

/**
 * POST /secure/destination/{placeId}/image
 * Roles with permission: Admin and Place's Ambassador
 * @returns id of the new image
 * https://github.com/satlantis-dev/api/blob/dev/rest/place_gallery.go
 */
export const postPlaceGalleryImage = (urlArg: URL, getJwt: () => string) =>
async (args: {
    placeId: number;
    url: string;
    source?: string;
    caption?: string;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/destination/${args.placeId}/image`;

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
 * DELETE /secure/destination/{placeId}/image/{id}
 * The api rejects the call if the image doesn't belong to placeId.
 * Roles with permission: Admin and Place's Ambassador
 * @returns nothing
 * https://github.com/satlantis-dev/api/blob/dev/rest/place_gallery.go
 */
export const deletePlaceGalleryImage =
    (urlArg: URL, getJwt: () => string) => async (args: { placeId: number; id: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/destination/${args.placeId}/image/${args.id}`;

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

// Bulk admin actions on destinations (platform admins only). `updated` counts the rows that
// changed: destinations already in the requested state, unknown ids and soft-deleted ones are
// skipped.
export type AdminPlacesResult = { updated: number };

async function adminPlacesRequest(
    urlArg: URL,
    getJwt: () => string,
    method: "PUT" | "DELETE",
    pathname: string,
    body: unknown,
) {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = pathname;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");
    const response = await safeFetch(url, { method, headers, body: JSON.stringify(body) });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<AdminPlacesResult>(response);
}

// PUT /secure/admin/destinations/active — sets the active flag on the listed destinations.
export const setPlacesActive =
    (urlArg: URL, getJwt: () => string) => async (args: { ids: number[]; active: boolean }) =>
        adminPlacesRequest(urlArg, getJwt, "PUT", "/secure/admin/destinations/active", args);

// DELETE /secure/admin/destinations — soft-deletes the listed destinations. All or nothing:
// 409 (naming them) when any still has a calendar or an upcoming event, or is the Satlantis
// fallback destination.
export const deletePlaces = (urlArg: URL, getJwt: () => string) => async (args: { ids: number[] }) =>
    adminPlacesRequest(urlArg, getJwt, "DELETE", "/secure/admin/destinations", args);

export interface AdminPlaceChanges {
    name?: string;
    description?: string;
    hashtags?: string[];
    boundingBox?: BoundingBox;
    /** New tier (the places.tier column). */
    tier?: number;
    /** Sets the tier to null; don't combine with `tier`. */
    clearTier?: boolean;
}

/**
 * PUT /secure/admin/destinations/{placeId}
 * Platform admins only. Fields left out are unchanged; an empty description or hashtag list clears it.
 * @returns the updated place
 */
export const adminUpdatePlace =
    (urlArg: URL, getJwt: () => string) => async (args: { placeId: number } & AdminPlaceChanges) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }
        const { placeId, ...changes } = args;
        const url = copyURL(urlArg);
        url.pathname = `/secure/admin/destinations/${placeId}`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, { method: "PUT", body: JSON.stringify(changes), headers });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<Place>(response);
    };
