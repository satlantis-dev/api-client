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

export interface IGeoapifyResultData {
    datasource: {
        sourcename: string;
        attribution: string;
        license: string;
        url: string;
    };
    name: string;
    country: string;
    countryCode: string;
    city: string;
    county: string;
    state: string;
    stateCode: string;
    postcode: string;
    district: string;
    suburb: string;
    lon: number;
    lat: number;
    housenumber: string;
    street: string;
    distance: number;
    resultType: string;
    formatted: string;
    addressLine1: string;
    addressLine2: string;
    category: string;
    timezone: {
        name: string;
        offsetSTD: string;
        offsetSTDSeconds: number;
        offsetDST: string;
        offsetDSTSeconds: number;
        abbreviationSTD: string;
        abbreviationDST: string;
    };
    rank: {
        importance: number;
        popularity: number;
        confidence: number;
        confidenceCityLevel: number;
        confidenceStreetLevel: number;
        matchType: string;
    };
    placeID: string;
    bbox: {
        lon1: number;
        lat1: number;
        lon2: number;
        lat2: number;
    };
}

export interface IGeoapifyData {
    results: Array<IGeoapifyResultData>;
    query: {
        text: string;
        lat: number;
        lon: number;
        plusCode: string;
        parsed: {
            housenumber: string;
            street: string;
            postcode: string;
            city: string;
            state: string;
            country: string;
        };
    };
}

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

export const getCoordinatesByAddress = (urlArg: URL) =>
async (args: {
    searchValue: string;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getCoordinatesByAddress`;
    url.searchParams.set("address", args.searchValue);
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    const res = await handleResponse<IGeoapifyData>(response);
    if (res instanceof Error) {
        return res;
    }
    console.log("res", res);
    const resultData = res.results[0];
    return {
        lat: resultData.lat,
        lng: resultData.lon,
    };
};
