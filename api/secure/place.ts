import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { Place } from "../../models/place.ts";

export const updatePlace = (urlArg: URL, getJwt: () => string) => async (place: Partial<Place>) => {
    if (!place.id) {
        return new Error("place id is empty");
    }

    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/updatePlace/${place.id}`;

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
 * POST /secure/postPlaceGalleryImage
 * Roles with permission: Admin and Place's Ambassador
 * @returns id of the new image
 * https://github.com/satlantis-dev/api/blob/dev/rest/place_gallery.go
 */
export const postPlaceGalleryImage = (urlArg: URL, getJwt: () => string) =>
async (args: {
    placeId: number;
    url: string;
    source: string;
    caption?: string;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/postPlaceGalleryImage`;

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
 * DELETE /secure/deletePlaceGalleryImage/:id
 * Roles with permission: Admin and Place's Ambassador
 * @returns nothing
 * https://github.com/satlantis-dev/api/blob/dev/rest/place_gallery.go
 */
export const deletePlaceGalleryImage =
    (urlArg: URL, getJwt: () => string) => async (args: { id: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/deletePlaceGalleryImage/${args.id}`;

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
