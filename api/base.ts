import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Theme } from "../models/community.ts";
import type { Timezone } from "../models/geo.ts";

export const getTimezoneInfo = (urlArg: URL) =>
async (args: {
    lat: number;
    lng: number;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getTimezoneInfo`;

    url.searchParams.set("lat", args.lat.toString());
    url.searchParams.set("lng", args.lng.toString());

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Timezone>(response);
};

export const getAllThemes = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = `/themes`;

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Theme[]>(response);
};
