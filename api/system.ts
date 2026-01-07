import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";

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
