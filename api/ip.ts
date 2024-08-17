import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { IPInfo } from "../models/ip.ts";

export const getIpInfo = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = `/ipInfo`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<IPInfo>(response);
};
