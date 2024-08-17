import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Place, PlaceCategoryScore, PlaceEvent, PlaceMetric } from "../models/place.ts";
import { type Region } from "../models/region.ts";

import { type PlaceNote } from "./note.ts";

/**
 * get the place based on OSM ID or ID, only 1 is needed
 */
export const getPlace = (urlArg: URL) => async (args: { osmRef: string | number }) => {
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
    sortColumn: "score" | "id" | "price";
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

/**
 * GET getPlaceNoteFeed/{placeID}
 */
export const getPlaceNoteFeed = (urlArg: URL) => async (args: { placeID: string | number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceNoteFeed/${args.placeID}`;
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
    return handleResponse<PlaceNote[]>(response);
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

export const getPlaceEvent = (urlArg: URL) =>
async (args: {
    placeID: number;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceEvent/${args.placeID}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<PlaceEvent>(response);
};
