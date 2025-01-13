import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Brand } from "../models/metric.ts";

/**
 * GET /getBrands
 */
export const getBrands = (urlArg: URL) => async (args: { names: string[] }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getBrands`;
    url.search = new URLSearchParams({ names: args.names.join(",") }).toString();
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Brand[]>(response);
};
