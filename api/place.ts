import { ApiError, copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import { Place, PlaceCategoryScore, PlaceMetric, PlaceNote, Region } from "./share_types.ts";

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
    console.log(url.toString());
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
    console.log(url.toString());
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
    console.log(url.toString());
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
    console.log(url.toString());
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<PlaceCategoryScore[]>(response);
};

/**
 * GET /getLocationsWithinBoundingBox/{placeID}
 */
export const getLocationsWithinBoundingBox = (urlArg: URL) =>
async (args: {
    sw_lat: number;
    sw_lng: number;
    ne_lat: number;
    ne_lng: number;
    category?: string;
    tags?: string;
    search?: string;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationsWithinBoundingBox`;

    url.searchParams.set("sw_lat", String(args.sw_lat));
    url.searchParams.set("sw_lng", String(args.sw_lng));
    url.searchParams.set("ne_lat", String(args.ne_lat));
    url.searchParams.set("ne_lng", String(args.ne_lng));

    console.log(url.toString());
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    const x = await handleResponse<PlaceCategoryScore[]>(response);
    return x;
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
