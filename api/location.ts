import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import { Location, LocationTag } from "./share_types.ts";

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
    google_rating?: number;
    search?: string;
    tag_category?: string;
    tags?: LocationTag[];
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationsWithinBoundingBox`;

    let tags = "";
    if (args.tags !== undefined) {
        const tagsArray: string[] = [];

        for (const tag of args.tags) {
            tagsArray.push(`${tag.key}-${tag.value}`);
        }

        tags = tagsArray.join(",");
    }

    url.searchParams.set("sw_lat", String(args.sw_lat));
    url.searchParams.set("sw_lng", String(args.sw_lng));
    url.searchParams.set("ne_lat", String(args.ne_lat));
    url.searchParams.set("ne_lng", String(args.ne_lng));
    url.searchParams.set("google_rating", String(args.google_rating));
    url.searchParams.set("tag_category", String(args.tag_category));
    url.searchParams.set("tags", tags);
    url.searchParams.set("search", String(args.search));

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    const x = await handleResponse<Location[]>(response);
    return x;
};
