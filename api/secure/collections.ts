import type { func_GetJwt } from "../../sdk.ts";
import { ApiError, copyURL, InvalidJSON, parseJSON } from "../../helpers/_helper.ts";
import { Aborted, type FetchResult, safeFetch } from "../../helpers/safe-fetch.ts";
import type { Collection } from "../../models/collection.ts";
import type { Account, AccountDTO } from "../../models/account.ts";

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

const createPublicUrl = (urlArg: URL, path: string) => {
    const url = copyURL(urlArg);
    url.pathname = path;
    return url;
};

const createSecureUrl = (urlArg: URL, path: string) => {
    const url = copyURL(urlArg);
    url.pathname = `/secure${path}`;
    return url;
};

/**
 * ==========================================
 *            GET COLLECTION.
 * ==========================================
 */
export type GetCollectionByIdArgs = {
    collectionId: number;
};
/**
 * Get Collection given a collectionId.
 */
export function getCollectionById(urlArg: URL) {
    return async (args: GetCollectionByIdArgs) => {
        const url = createPublicUrl(urlArg, `/collection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "GET",
        });

        if (response instanceof Error) return response;

        return handleResponse<Collection>(response);
    };
}

/**
 * ==========================================
 *            COLLECTION CRUD.
 * ==========================================
 */
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

        const url = createSecureUrl(urlArg, "/collection");

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
    collectionId: number;
    name: string;
    description?: string;
    cover?: string;
    isPublic: boolean;
};
/**
 * Edit Collection.
 */
export function editCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async ({ collectionId, ...args }: EditCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collection/${collectionId}`);

        const response = await safeFetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse<Collection>(response);
    };
}

export type MarkCollectionAsFeaturedArgs = {
    collectionId: number;
};

export function markCollectionAsFeatured(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: MarkCollectionAsFeaturedArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collection/${args.collectionId}/mark-featured`);

        const response = await safeFetch(url, {
            method: "PUT",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse(response);
    };
}

export type UnmarkCollectionAsFeaturedArgs = {
    collectionId: number;
};

export function unmarkCollectionAsFeatured(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: UnmarkCollectionAsFeaturedArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collection/${args.collectionId}/unmark-featured`);

        const response = await safeFetch(url, {
            method: "PUT",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse(response);
    };
}

export type DeleteCollectionArgs = {
    collectionId: number;
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

        const url = createSecureUrl(urlArg, `/collection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse(response);
    };
}

/**
 * ==========================================
 *       MANAGE COLLECTION LOCATIONS.
 * ==========================================
 */
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
    return async ({ googleId, ...args }: AddLocationToCollectionsArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collections/place/${googleId}`);

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
    return async ({ googleId, ...args }: RemoveLocationFromCollectionsArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collections/place/${googleId}`);

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
    return async ({ googleId, ...args }: UpdateLocationCollectionsArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collections/place/${googleId}`);

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
    collectionId: number;
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
    return async ({ collectionId, googleId, ...args }: UpdateCollectionLocationArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collection/${collectionId}/place/${googleId}`);

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
 * ==========================================
 *           SEARCH & DISCOVERY.
 * ==========================================
 */
export type SearchCollectionsArgs = {
    page?: number;
    limit?: number;
    search?: string;
    placeId?: number;
    category?: string;
    tags?: string;
};

export function searchCollections(urlArg: URL) {
    return async (args?: SearchCollectionsArgs) => {
        const url = createPublicUrl(urlArg, "/collections");

        if (args?.page) url.searchParams.set("page", args.page.toString());
        if (args?.limit) url.searchParams.set("limit", args.limit.toString());
        if (args?.search) url.searchParams.set("search", args.search);
        if (args?.placeId) url.searchParams.set("placeId", args.placeId.toString());
        if (args?.category) url.searchParams.set("category", args.category);

        const response = await safeFetch(url, {
            method: "GET",
        });

        if (response instanceof Error) return response;
        return handleResponse<Collection[]>(response);
    };
}

export type GetNewestCollectionsArgs = {
    placeId?: number;
};

export function getNewestCollections(urlArg: URL) {
    return async (args?: GetNewestCollectionsArgs) => {
        const url = createPublicUrl(urlArg, "/collections/newest");

        if (args?.placeId) url.searchParams.set("placeId", args.placeId.toString());

        const response = await safeFetch(url, {
            method: "GET",
        });

        if (response instanceof Error) return response;
        return handleResponse<Collection[]>(response);
    };
}

export type GetPopularCollectionsArgs = {
    placeId?: number;
};

export function getPopularCollections(urlArg: URL) {
    return async (args?: GetPopularCollectionsArgs) => {
        const url = createPublicUrl(urlArg, "/collections/popular");

        if (args?.placeId) url.searchParams.set("placeId", args.placeId.toString());

        const response = await safeFetch(url, {
            method: "GET",
        });

        if (response instanceof Error) return response;
        return handleResponse<Collection[]>(response);
    };
}

export type GetRecommendedCollectionsArgs = {
    placeId?: number;
};

export function getRecommendedCollections(urlArg: URL, getJwt: func_GetJwt) {
    return async (args?: GetRecommendedCollectionsArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, "/collections/recommended");

        if (args?.placeId) url.searchParams.set("placeId", args.placeId.toString());

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<Collection[]>(response);
    };
}

export function getCollectors(urlArg: URL) {
    return async () => {
        const url = createPublicUrl(urlArg, "/collections/collectors");

        const response = await safeFetch(url, {
            method: "GET",
        });

        if (response instanceof Error) return response;
        return handleResponse<(Collection & { account: Account })[]>(response);
    };
}

export type GetFeaturedCollectionsArgs = {
    placeId?: number;
};

export function getFeaturedCollections(urlArg: URL) {
    return async (args?: GetFeaturedCollectionsArgs) => {
        const url = createPublicUrl(urlArg, "/collections/featured");

        if (args?.placeId) url.searchParams.set("placeId", args.placeId.toString());

        const response = await safeFetch(url, {
            method: "GET",
        });

        if (response instanceof Error) return response;
        return handleResponse<Collection[]>(response);
    };
}

/**
 * ==========================================
 *            ACCOUNT COLLECTIONS.
 * ==========================================
 */

export function getUserCollections(urlArg: URL, getJwt: func_GetJwt) {
    return async () => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, "/user/collections");

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

        const url = createSecureUrl(urlArg, `/user/collections/place/${args.googleId}`);

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
export function getAccountCollections(urlArg: URL) {
    return async (args: GetAccountCollectionsArgs) => {
        const url = createPublicUrl(urlArg, `/account/${args.npub}/collections`);

        const response = await safeFetch(url, {
            method: "GET",
        });

        if (response instanceof Error) return response;
        return handleResponse<Collection[]>(response);
    };
}

/**
 * ==========================================
 *            SAVE COLLECTIONS.
 * ==========================================
 */

export type SaveCollectionArgs = {
    collectionId: number;
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

        const url = createSecureUrl(urlArg, `/user/saves/collection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "POST",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<SaveCollectionResponse>(response);
    };
}

export type UnsaveCollectionArgs = {
    collectionId: number;
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

        const url = createSecureUrl(urlArg, `/user/saves/collection/${args.collectionId}`);

        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<UnsaveCollectionResponse>(response);
    };
}

export type GetCollectionSavesArgs = {
    collectionId: number;
};

export function getCollectionSaves(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: GetCollectionSavesArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collection/${args.collectionId}/saves`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<AccountDTO[]>(response);
    };
}

/**
 * ==========================================
 *          SHARING & COLLABORATION.
 * ==========================================
 */

export type AddViewerToCollectionArgs = {
    collectionId: number;
    viewerId: string;
};
export type AddViewerToCollectionResponse = {
    message: string;
};
/**
 * Add Viewer to Collection.
 */
export function addViewerToCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async ({ collectionId, ...args }: AddViewerToCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collection/${collectionId}/add-viewer`);

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
    collectionId: number;
    viewerId: string;
};
export type RemoveViewerFromCollectionResponse = {
    message: string;
};
/**
 * Remove Viewer from Collection.
 */
export function removeViewerFromCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async ({ collectionId, ...args }: RemoveViewerFromCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collection/${collectionId}/remove-viewer`);

        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse<RemoveViewerFromCollectionResponse>(response);
    };
}

export type InviteContributorToCollectionArgs = {
    collectionId: number;
    contributorId: string;
};

export type InviteContributorToCollectionResponse = {
    message: string;
};

export function inviteContributorToCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: InviteContributorToCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collection/${args.collectionId}/invite-contributor`);

        const response = await safeFetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse<InviteContributorToCollectionResponse>(response);
    };
}

export type AcceptInvitationToCollectionArgs = {
    collectionId: number;
};

export type AcceptInvitationToCollectionResponse = {
    message: string;
};

export function acceptInvitationToCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: AcceptInvitationToCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collection/${args.collectionId}/accept-invitation`);

        const response = await safeFetch(url, {
            method: "PUT",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<AcceptInvitationToCollectionResponse>(response);
    };
}

export type DeclineInvitationToCollectionArgs = {
    collectionId: number;
};

export type DeclineInvitationToCollectionResponse = {
    message: string;
};

export function declineInvitationToCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: DeclineInvitationToCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collection/${args.collectionId}/decline-invitation`);

        const response = await safeFetch(url, {
            method: "PUT",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<DeclineInvitationToCollectionResponse>(response);
    };
}

export type RemoveContributorFromCollectionArgs = {
    collectionId: number;
    contributorId: string;
};
export type RemoveContributorFromCollectionResponse = {
    message: string;
};
/**
 * Remove Contributor from Collection.
 */
export function removeContributorFromCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async ({ collectionId, ...args }: RemoveContributorFromCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, `/collection/${collectionId}/remove-contributor`);

        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse<RemoveContributorFromCollectionResponse>(response);
    };
}

export type CanEditCollectionArgs = {
    collectionId: number;
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

        const url = createSecureUrl(urlArg, `/user/permissions/collection/${args.collectionId}/edit`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<CanEditCollectionResponse>(response);
    };
}

/**
 * ==========================================
 *      IMPORT GOOGLE MAPS COLLECTION.
 * ==========================================
 */
export type ImportGoogleMapsCollectionArgs = {
    name: string;
    url: string;
};

export function importGoogleMapsCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: ImportGoogleMapsCollectionArgs) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = createSecureUrl(urlArg, "/collections/import-from-google-maps");

        const response = await safeFetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) return response;
        return handleResponse(response);
    };
}
