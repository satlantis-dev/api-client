import type { func_GetJwt } from "../../sdk.ts";
import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { Collection } from "../../models/collection.ts";

const createUrl = (urlArg: URL, path: string) => {
    const url = copyURL(urlArg);
    url.pathname = path;
    return url;
};

/**
 * Get Collection given a collectionId.
 */
export type GetCollectionByIdArgs = {
    collectionId: string;
};
export function getCollectionById(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: GetCollectionByIdArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/getCollection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<Collection>(response);
    };
}

/**
 * Get User Collections.
 */
export function getUserCollections(urlArg: URL, getJwt: func_GetJwt) {
    return async () => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, "/secure/getUserCollections");

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<Collection[]>(response);
    };
}

/**
 * Get User Collections for Location.
 */
export type GetUserCollectionsForLocationArgs = {
    googleId: string;
};
export type GetUserCollectionsForLocationResponse = {
    withLocation: (Omit<Collection, "locations"> & { locations: null })[];
    withoutLocation: (Omit<Collection, "locations"> & { locations: null })[];
};
export function getUserCollectionsForLocation(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: GetUserCollectionsForLocationArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/getUserCollectionsForLocation/${args.googleId}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<GetUserCollectionsForLocationResponse>(response);
    };
}

/**
 * Get Account Collections.
 * This will only return public collections.
 */
export function getAccountCollections(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: { npub: string }) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/getAccountCollections/${args.npub}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<Collection[]>(response);
    };
}

/**
 * Create Collection.
 */
export type CreateCollectionArgs = {
    name: string;
    description?: string;
    coverImage?: string;
    isPublic: boolean;
};
export type CreateCollectionResponse = Omit<Collection, "locations"> & {
    locations: null;
};
export function createCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: CreateCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, "/secure/createCollection");

        const response = await safeFetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) {
            return response;
        }

        return handleResponse<CreateCollectionResponse>(response);
    };
}

/**
 * Edit Collection.
 */
export type EditCollectionArgs = {
    collectionId: string;
    name: string;
    description?: string;
    coverImage?: string;
    isPublic: boolean;
};
export function editCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: EditCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/editCollection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse<Collection>(response);
    };
}

/**
 * Can Edit Collection.
 * This will return true ONLY if the user is allowed to edit the collection.
 */
export type CanEditCollectionArgs = {
    collectionId: string;
};
export type CanEditCollectionResponse = {
    canEdit: boolean;
};
export function canEditCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: CanEditCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/canEditCollection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<CanEditCollectionResponse>(response);
    };
}

/**
 * Delete Collection.
 */
export type DeleteCollectionArgs = {
    collectionId: string;
};
export function deleteCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: DeleteCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/deleteCollection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse(response);
    };
}

/**
 * Add Location to Collection.
 */
export type AddLocationToCollectionArgs = {
    collectionIds: string[];
    googleId: string;
};
export type AddLocationToCollectionResponse = {
    message: string;
};
export function addLocationToCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: AddLocationToCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/addToCollections/${args.googleId}`);

        const response = await safeFetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse<AddLocationToCollectionResponse>(response);
    };
}

/**
 * Remove Location from Collection.
 */
export type RemoveLocationFromCollectionArgs = {
    collectionIds: string[];
    googleId: string;
};
export type RemoveLocationFromCollectionResponse = {
    message: string;
};
export function removeLocationFromCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: RemoveLocationFromCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/removeFromCollections/${args.googleId}`);

        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse<RemoveLocationFromCollectionResponse>(response);
    };
}

/**
 * Update Location Collections.
 * This will either add or remove the location from the collections.
 *
 * For example, if the location is currently in `collectionIds: [1, 2]`
 * calling this API with `collectionIds: [2, 3]`, it will remove the location from collection 1 and add it to collection 3.
 */
export type UpdateLocationCollectionsArgs = {
    collectionIds: string[];
    googleId: string;
};
export type UpdateLocationCollectionsResponse = {
    message: string;
};
export function updateLocationCollections(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: UpdateLocationCollectionsArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/updateCollections/${args.googleId}`);

        const response = await safeFetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse<UpdateLocationCollectionsResponse>(response);
    };
}

/**
 * Update Collection Location.
 * This will update the location details in a given collection
 */
export type UpdateCollectionLocationArgs = {
    collectionId: string;
    googleId: string;

    blurb: string;
    seqNum?: number;
};
export type UpdateCollectionLocationResponse = {
    message: string;
};
export function updateCollectionLocation(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: UpdateCollectionLocationArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/collection/${args.collectionId}/location/${args.googleId}`);

        const response = await safeFetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse<UpdateCollectionLocationResponse>(response);
    };
}

/**
 * Save Collection.
 */
export type SaveCollectionArgs = {
    collectionId: string;
};
export type SaveCollectionResponse = {
    message: string;
};
export function saveCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: SaveCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/saveCollection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "POST",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<SaveCollectionResponse>(response);
    };
}

/**
 * Unsave Collection.
 */
export type UnsaveCollectionArgs = {
    collectionId: string;
};
export type UnsaveCollectionResponse = {
    message: string;
};
export function unsaveCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: UnsaveCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/unsaveCollection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<UnsaveCollectionResponse>(response);
    };
}

/**
 * Add Contributor to Collection.
 */
export type AddContributorToCollectionArgs = {
    collectionId: string;
    contributorId: string;
};
export type AddContributorToCollectionResponse = {
    message: string;
};
export function addContributorToCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: AddContributorToCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/addContributorToCollection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse<AddContributorToCollectionResponse>(response);
    };
}

/**
 * Remove Contributor from Collection.
 */
export type RemoveContributorFromCollectionArgs = {
    collectionId: string;
    contributorId: string;
};
export type RemoveContributorFromCollectionResponse = {
    message: string;
};
export function removeContributorFromCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: RemoveContributorFromCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/removeContributorFromCollection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse<RemoveContributorFromCollectionResponse>(response);
    };
}

/**
 * Add Viewer to Collection.
 */
export type AddViewerToCollectionArgs = {
    collectionId: string;
    viewerId: string;
};
export type AddViewerToCollectionResponse = {
    message: string;
};
export function addViewerToCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: AddViewerToCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/addViewerToCollection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse<AddViewerToCollectionResponse>(response);
    };
}

/**
 * Remove Viewer from Collection.
 */
export type RemoveViewerFromCollectionArgs = {
    collectionId: string;
    viewerId: string;
};
export type RemoveViewerFromCollectionResponse = {
    message: string;
};
export function removeViewerFromCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: RemoveViewerFromCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/secure/removeViewerFromCollection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse<RemoveViewerFromCollectionResponse>(response);
    };
}
