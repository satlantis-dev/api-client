import type { func_GetJwt } from "../../sdk.ts";
import { ApiError, copyURL, InvalidJSON, parseJSON } from "../../helpers/_helper.ts";
import { Aborted, type FetchResult, safeFetch } from "../../helpers/safe-fetch.ts";
import type { Collection } from "../../models/collection.ts";

/**
 * Re-creating handleResponse because the success status code should be between 200 and 299, not just 200.
 */
const handleResponse = async <T extends {}>(response: FetchResult) => {
    const body = await response.text();
    if (body instanceof Aborted) {
        return body;
    }

    // 200-299 is success.
    if (response.status < 200 || response.status >= 300) {
        return new ApiError(response.status, body);
    }
    if (!body) {
        return {} as T;
    }
    const result = parseJSON<T>(body);
    if (result instanceof InvalidJSON) {
        return result;
    }
    return result as T;
};

const createUrl = (urlArg: URL, path: string) => {
    const url = copyURL(urlArg);
    url.pathname = path;
    return url;
};

export type GetCollectionByIdArgs = {
    collectionId: string;
};
/**
 * Get Collection given a collectionId.
 */
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

export type GetUserCollectionsForLocationArgs = {
    googleId: string;
};
export type GetUserCollectionsForLocationResponse = {
    withLocation: (Omit<Collection, "locations"> & { locations: null })[];
    withoutLocation: (Omit<Collection, "locations"> & { locations: null })[];
};
/**
 * Get User Collections for Location.
 */
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

export type GetAccountCollectionsArgs = {
    npub: string;
};
/**
 * Get Account Collections.
 * This will only return public collections.
 */
export function getAccountCollections(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: GetAccountCollectionsArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createUrl(urlArg, `/getAccountCollections/${args.npub}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<Collection[]>(response);
    };
}

export type CreateCollectionArgs = {
    name: string;
    description?: string;
    cover?: string;
    isPublic: boolean;
};
export type CreateCollectionResponse = Omit<Collection, "locations"> & {
    locations: null;
};
/**
 * Create Collection.
 */
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

export type EditCollectionArgs = {
    collectionId: string;
    name: string;
    description?: string;
    cover?: string;
    isPublic: boolean;
};
/**
 * Edit Collection.
 */
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

export type CanEditCollectionArgs = {
    collectionId: string;
};
export type CanEditCollectionResponse = {
    canEdit: boolean;
};
/**
 * Can Edit Collection.
 * This will return true ONLY if the user is allowed to edit the collection.
 */
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

export type DeleteCollectionArgs = {
    collectionId: string;
};
/**
 * Delete Collection.
 */
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

export type AddLocationToCollectionsArgs = {
    collectionIds: number[];
    googleId: string;
};
export type AddLocationToCollectionsResponse = {
    message: string;
};
/**
 * Add Location to Collection.
 */
export function addLocationToCollections(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: AddLocationToCollectionsArgs) => {
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
        return handleResponse<AddLocationToCollectionsResponse>(response);
    };
}

export type RemoveLocationFromCollectionsArgs = {
    collectionIds: number[];
    googleId: string;
};
export type RemoveLocationFromCollectionsResponse = {
    message: string;
};
/**
 * Remove Location from Collection.
 */
export function removeLocationFromCollections(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: RemoveLocationFromCollectionsArgs) => {
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
        return handleResponse<RemoveLocationFromCollectionsResponse>(response);
    };
}

export type UpdateLocationCollectionsArgs = {
    collectionIds: number[];
    googleId: string;
};
export type UpdateLocationCollectionsResponse = {
    message: string;
};
/**
 * Update Location Collections.
 * This will either add or remove the location from the collections.
 *
 * For example, if the location is currently in `collectionIds: [1, 2]`
 * calling this API with `collectionIds: [2, 3]`, it will remove the location from collection 1 and add it to collection 3.
 */
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

export type UpdateCollectionLocationArgs = {
    collectionId: string;
    googleId: string;

    blurb: string;
    seqNum?: number;
};
export type UpdateCollectionLocationResponse = {
    message: string;
};
/**
 * Update Collection Location.
 * This will update the location details in a given collection
 */
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

export type SaveCollectionArgs = {
    collectionId: string;
};
export type SaveCollectionResponse = {
    message: string;
};
/**
 * Save Collection.
 */
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

export type UnsaveCollectionArgs = {
    collectionId: string;
};
export type UnsaveCollectionResponse = {
    message: string;
};
/**
 * Unsave Collection.
 */
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

export type AddContributorToCollectionArgs = {
    collectionId: string;
    contributorId: string;
};
export type AddContributorToCollectionResponse = {
    message: string;
};
/**
 * Add Contributor to Collection.
 */
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

export type RemoveContributorFromCollectionArgs = {
    collectionId: string;
    contributorId: string;
};
export type RemoveContributorFromCollectionResponse = {
    message: string;
};
/**
 * Remove Contributor from Collection.
 */
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

export type AddViewerToCollectionArgs = {
    collectionId: string;
    viewerId: string;
};
export type AddViewerToCollectionResponse = {
    message: string;
};
/**
 * Add Viewer to Collection.
 */
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

export type RemoveViewerFromCollectionArgs = {
    collectionId: string;
    viewerId: string;
};
export type RemoveViewerFromCollectionResponse = {
    message: string;
};
/**
 * Remove Viewer from Collection.
 */
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
