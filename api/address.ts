import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";

export type AddressLookupResult = {
    displayName: {
        text: string;
        languageCode: "en";
    };
    formattedAddress: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    priceLevel: string;
};

// addressLookup
export const addressLookup = (urlArg: URL) =>
async (args: {
    address: string;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/addressLookup`;
    url.searchParams.set("address", args.address);
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    const res = await handleResponse<{ places: AddressLookupResult[] }>(response);
    if (res instanceof Error) {
        return res;
    }
    return res.places;
};
