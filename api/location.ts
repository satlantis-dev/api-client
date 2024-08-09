import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import { Location, LocationTag, PlaceEvent } from "./share_types.ts";

export const getLocationTags = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationTags`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<LocationTag[]>(response);
};

/**
 * @unstable
 * @param tags currently tags are not used
 */
export const getLocationsWithinBoundingBox = (urlArg: URL) =>
async (args: {
    sw_lat: number;
    sw_lng: number;
    ne_lat: number;
    ne_lng: number;
    category?: string;
    tags?: LocationTag[];
    search?: string;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationsWithinBoundingBox`;

    url.searchParams.set("sw_lat", String(args.sw_lat));
    url.searchParams.set("sw_lng", String(args.sw_lng));
    url.searchParams.set("ne_lat", String(args.ne_lat));
    url.searchParams.set("ne_lng", String(args.ne_lng));
    url.searchParams.set("search", String(args.search));
    url.searchParams.set("category", String(args.category));

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    const x = await handleResponse<Location[]>(response);
    return x;
};
