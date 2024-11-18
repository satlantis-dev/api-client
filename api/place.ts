import type { PlaceCalendarEvent } from "@satlantis/api-client";
import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Place, PlaceCategoryScore, PlaceEvent, PlaceMetric } from "../models/place.ts";
import { type Region } from "../models/region.ts";

import { type PlaceNote } from "./note.ts";

export const getPlaceNames = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceNames`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<string[]>(response);
};

export const getAllPlaceRegionCountryNames = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = `/getAllPlaceRegionCountryNames`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<string[]>(response);
};

/**
 * get the place based on OSM ID or ID, only 1 is needed
 */
export const getPlaceByOsmRef = (urlArg: URL) => async (args: { osmRef: string | number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlace/${args.osmRef}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Place>(response);
};

export const getPlaces = (urlArg: URL) =>
async (args: {
    filters: {
        name: string;
    };
    limit: number;
    page: number;
    sortColumn: "score" | "id" | "price" | "trending" | "topPicks";
    sortDirection: "desc" | "asc";
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaces`;
    url.searchParams.append("filters", JSON.stringify(args.filters));
    url.searchParams.append("limit", JSON.stringify(args.limit));
    url.searchParams.append("page", JSON.stringify(args.page));
    url.searchParams.append("sortColumn", args.sortColumn);
    url.searchParams.append("sortDirection", args.sortDirection);

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Place[]>(response);
};

export const getPlacesMinimal = (urlArg: URL) =>
async (args: {
    filters: {
        name: string;
    };
    limit: number;
    page: number;
    sortColumn: "score" | "id" | "price";
    sortDirection: "desc" | "asc";
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlacesMinimal`;
    url.searchParams.append("filters", JSON.stringify(args.filters));
    url.searchParams.append("limit", JSON.stringify(args.limit));
    url.searchParams.append("page", JSON.stringify(args.page));
    url.searchParams.append("sortColumn", args.sortColumn);
    url.searchParams.append("sortDirection", args.sortDirection);

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ id: number; name: string; country_name: string }[]>(response);
};

/**
 * GET getPlaceNotes/{placeID}
 */
export const getPlaceNotes =
    (urlArg: URL) => async (args: { accountID?: number; placeID: string | number; page: number; limit: number }) => {
        const url = copyURL(urlArg);
        url.pathname = `/getPlaceNotes/${args.placeID}`;
        url.searchParams.set("page", String(args.page));
        url.searchParams.set("limit", String(args.limit));

        if (args.accountID) {
            url.searchParams.set("accountId", String(args.accountID));
        }

        const response = await safeFetch(url);
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<PlaceNote[]>(response);
    };

/**
 * GET /getPlaceMetrics/{placeID}
 */
export const getPlaceMetrics = (urlArg: URL) => async (args: { placeID: string | number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceMetrics/${args.placeID}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<PlaceMetric[]>(response);
};

/**
 * GET /getPlaceGallery/{placeID}
 */
export const getPlaceGallery = (urlArg: URL) => async (args: { placeID: string | number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceGallery/${args.placeID}`;

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<PlaceNote[]>(response);
};

/**
 * GET /getPlaceCalendarEvents/{placeID}
 */
export const getPlaceCalendarEvents = (urlArg: URL) => async (args: { placeID: string | number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceCalendarEvents/${args.placeID}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<PlaceCalendarEvent[]>(response);
};

/**
 * GET /getPlaceChats/{placeID}
 */
export const getPlaceChats = (urlArg: URL) => async (args: { placeID: string | number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceChats/${args.placeID}`;

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<PlaceNote[]>(response);
};

/**
 * GET /getPlaceCategoryScores/{placeID}
 */
export const getPlaceCategoryScores = (urlArg: URL) => async (args: { placeID: string | number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceCategoryScores/${args.placeID}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<PlaceCategoryScore[]>(response);
};

export const getRegion = (urlArg: URL) => async (args: { regionID: number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getRegion/${args.regionID}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Region>(response);
};

export const getPlaceEvent = (urlArg: URL) => async (args: { placeID: number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceEvent/${args.placeID}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<PlaceEvent>(response);
};
