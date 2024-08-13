import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";

import { Metric } from "./metric.ts";
import { PlaceNote } from "./note.ts";
import { Region } from "./region.ts";
import { AccountPlaceRole } from "./secure/account.ts";
import { Category, Country, NostrEvent, ProcessedTag, Topic, Weather } from "./share_types.ts";

export type PlaceLevel = "region" | "city" | "neighborhood";
export type OSMType = "node" | "relation" | "way";

export type Place = {
    id: number;
    accountRoles: AccountPlaceRole[];
    banner: string;
    categoryScores: PlaceCategoryScore[];
    description: string;
    eventId: number;
    event?: NostrEvent;
    lat: number;
    level: PlaceLevel;
    lng: number;
    metrics: PlaceMetric[];
    osmId: number;
    osmRef: string;
    regionId: number;
    region: Region;
    slug: string;
    name: string;
    countryId: number;
    country: Country;
    weather: Weather;
};

export interface PlaceMetric {
    dataPoints: number;
    cityId: number;
    metricId: number;
    metric: Metric;
    updatedAt?: Date;
    score: number;
    topicId: number;
    topic: Topic;
    value: number;
    valueStr: string;
}

export interface PlaceCategoryScore {
    categoryId: number;
    category: Category;
    cityId: number;
    score: number;
    topicScores: PlaceTopicScore[];
    updatedAt: Date;
}

export interface PlaceTopicScore {
    categoryId: number;
    cityId: number;
    score: number;
    topicId: number;
    topic: Topic;
    updatedAt: Date;
}

export type PlaceEvent = {
    readonly id: number;
    readonly nostrId: string;
    readonly createdAt: number;
    readonly content: string;
    readonly kind: 37515;
    readonly pubkey: string;
    readonly sig: string;
    readonly tags: ProcessedTag[];
    readonly reconciled: boolean;
};

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
    sortColumn: "score";
    sortDirection: "desc";
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaces`;
    url.searchParams.append("name", JSON.stringify(args.filters));
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
