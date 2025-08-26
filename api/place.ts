import type { CalendarEventType, FeedNote, PlaceCalendarEvent } from "@satlantis/api-client";
import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type {
    Place,
    PlaceCategoryScore,
    PlaceEvent,
    PlaceGalleryImage,
    PlaceMetric,
} from "../models/place.ts";
import { type Region } from "../models/region.ts";

import { type PlaceNote } from "./note.ts";
import type { PlaceMinimal } from "../models/location.ts";

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

export const getPlaceById = (urlArg: URL) => async (args: { id: number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceByID/${args.id}`;
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
    active_only?: boolean;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaces`;
    url.searchParams.append("filters", JSON.stringify(args.filters));
    url.searchParams.append("limit", JSON.stringify(args.limit));
    url.searchParams.append("page", JSON.stringify(args.page));
    url.searchParams.append("sortColumn", args.sortColumn);
    url.searchParams.append("sortDirection", args.sortDirection);

    if (args.active_only) {
        url.searchParams.append("active_only", String(args.active_only));
    } else {
        // Default to false if not provided
        url.searchParams.append("active_only", "false");
    }

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Place[]>(response);
};

export type GetPlacesMinimalArgs = {
    filters: {
        name: string;
    };
    limit: number;
    page: number;
    sortColumn: "score" | "id" | "price";
    sortDirection: "desc" | "asc";
    active_only?: boolean;
}

export const getPlacesMinimal = (urlArg: URL) => async (args: GetPlacesMinimalArgs) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlacesMinimal`;
    url.searchParams.append("filters", JSON.stringify(args.filters));
    url.searchParams.append("limit", JSON.stringify(args.limit));
    url.searchParams.append("page", JSON.stringify(args.page));
    url.searchParams.append("sortColumn", args.sortColumn);
    url.searchParams.append("sortDirection", args.sortDirection);

    if (args.active_only) {
        url.searchParams.append("active_only", String(args.active_only));
    } else {
        // Default to false if not provided
        url.searchParams.append("active_only", "false");
    }

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }

    return handleResponse<PlaceMinimal[]>(response);
};

/**
 * GET getPlaceNotes/{placeID}
 */
export const getPlaceNotes =
    (urlArg: URL) =>
    async (args: { accountID?: number; placeID: string | number; page: number; limit: number }) => {
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
        return handleResponse<FeedNote[]>(response);
    };

/**
 * GET /getPlaceMetrics/{placeID}
 */
export const getPlaceMetrics = (urlArg: URL) => async (args: { placeID: string | number; name?: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceMetrics/${args.placeID}`;
    if (args.name) {
        url.searchParams.set("name", args.name);
    }
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    if (args.name) {
        return handleResponse<PlaceMetric>(response);
    } else {
        return handleResponse<PlaceMetric[]>(response);
    }
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
 * GET /getCalendarEventTypes
 */
export const getCalendarEventTypes = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = `/getCalendarEventTypes`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CalendarEventType[]>(response);
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

/**
 * GET /getPlaceGalleryImages/{placeID}
 */
export const getPlaceGalleryImages = (urlArg: URL) => async (args: { placeID: number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceGalleryImages/${args.placeID}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<PlaceGalleryImage[]>(response);
};
