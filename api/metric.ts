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
    const brands = await handleResponse<Brand[]>(response);
    if (brands instanceof Error) {
        return brands;
    }

    const validBrands = brands.filter((brand, index) => {
        try {
            new URL(brand.website);
            new URL(brand.logo);
            return true;
        } catch (e) {
            console.warn(
                `Brand at index ${index} (${brand.name}) has invalid URL: ${brand.website} or ${brand.logo}`,
            );
            return false;
        }
    });

    return validBrands;
};

/**
 * GET /getExchangeRate
 */
export const getExchangeRate = (urlArg: URL) => async (args: { code: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getExchangeRate/${args.code}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        rate: number;
    }>(response);
};
