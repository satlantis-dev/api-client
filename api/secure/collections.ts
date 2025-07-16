/**
  secure.HandleFunc("/editCollection/{collectionId}", rest.editCollection).Methods("PUT")
  secure.HandleFunc("/deleteCollection/{collectionId}", rest.deleteCollection).Methods("DELETE")
  // Get collection details
  secure.HandleFunc("/getCollection/{collectionId}", rest.getCollectionByID).Methods("GET")
  // Get collections
  public.HandleFunc("/getAccountCollections/{npub}", rest.getAccountCollections).Methods("GET")
  secure.HandleFunc("/getUserCollectionsForLocation/{googleId}", rest.getUserCollectionsForLocation).Methods("GET")
  // Add / remove / edit location in collections
  secure.HandleFunc("/addToCollections/{googleId}", rest.addLocationToCollections).Methods("PUT")
  secure.HandleFunc("/removeFromCollections/{googleId}", rest.removeLocationFromCollections).Methods("PUT")
  secure.HandleFunc("/updateCollections/{googleId}", rest.updateLocationCollections).Methods("PUT")
  secure.HandleFunc("/collection/{collectionId}/location/{googleId}", rest.editCollectionLocation).Methods("PUT")
  // Save collections
  secure.HandleFunc("/saveCollection/{collectionId}", rest.saveCollection).Methods("POST")
  secure.HandleFunc("/unsaveCollection/{collectionId}", rest.unsaveCollection).Methods("DELETE")
 */

import type { func_GetJwt } from "../../sdk.ts";
import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { Collection } from "../../models/collection.ts";

/**
 * Create Collection.
 */
export type CreateCollectionArgs = {
    accountId: number;
    name: string;
    description?: string;
    coverImage?: string;
    isPublic: boolean;
};

export function createCollection(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: CreateCollectionArgs) => {
        const jwtToken = getJwt();

        if (!jwtToken) {
            return new Error("JWT token is empty.");
        }

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        
        const url = copyURL(urlArg);
        url.pathname = "/secure/createCollection";

        const response = await safeFetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) {
            return response;
        }

        return handleResponse(response);
    };
}

/**
 * Get User Collections.
 */
export function getUserCollections(urlArg: URL, getJwt: func_GetJwt) {
    return async () => {
        const jwtToken = getJwt();

        if (jwtToken == "") {
            return new Error('JWT token is empty.');
        }

        const headers = new Headers();
        headers.set('Authorization', `Bearer ${jwtToken}`);

        const url = copyURL(urlArg);
        url.pathname = '/secure/getUserCollections';

        const response = await safeFetch(url, {
            method: 'GET',
            headers
        })

        if (response instanceof Error) {
            return response;
        }

        return handleResponse<Collection[]>(response);
    }
}