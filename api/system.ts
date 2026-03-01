import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { SystemVersion } from "../models/system.ts";

export const getSystemBanners = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = `/system/banners`;

    const response = await safeFetch(url, {
        method: "GET",
    });

    if (response instanceof Error) {
        return response;
    }

    return handleResponse<string[]>(response);
};

export type GetSystemVersionArgs = {
    platform: "ios" | "android";
};

export const getSystemVersion = (urlArg: URL) => async (args: GetSystemVersionArgs) => {
    const url = copyURL(urlArg);
    url.pathname = `/system/version`;
    url.searchParams.set("platform", args.platform);

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<SystemVersion>(response);
};
