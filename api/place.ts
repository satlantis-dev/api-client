import { safeFetch } from "../fetch.ts";
import { ApiError, newURL } from "../sdk.ts";
import { PlaceLevel, OSMType } from "./share_types.ts";


export type Place = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    active: boolean;
    banner: string;
    countryId: number;
    description: string;
    eventId?: number | null;
    lat: number;
    level: PlaceLevel;
    lng: number;
    name: string;
    osmId?: number | null;
    osmLevel: string;
    osmType: OSMType;
    osmRef: string;
    regionId?: number | null;
    slug: string;
    weatherId?: number | null;
    hashtags: string[];
}

/**
 * get the place based on OSM ID or ID, only 1 is needed
 * GET /getPlace?osmID=123
 */
export const getPlace = (urlArg: string | URL) => async (args: {
    osmID: number | undefined
}): Promise<Place | TypeError | DOMException | SyntaxError | ApiError>  => {
    // constructing a new URL so that we don't modify the input
    const url = newURL(urlArg)
    if(url instanceof TypeError) {
        return url
    }
    url.pathname = `/v2/place/`
    const response = await safeFetch(url)
    if(response instanceof Error) {
        return response
    }
    if(response.status != 200) {
        const t = await response.text()
        if(t instanceof Error) {
            return t;
        }
        return new ApiError(response.status, t)
    }
    const result = await response.json()
    if(result instanceof Error) {
        return result
    }

    return result as Place // consider zod for runtime type checks
}

/**
 * GET /getPlace?osmID=123
 */
export const getNotesOfPlace = (urlArg: string | URL) => async (args: {
    placeID: number
}): Promise<{} | TypeError | DOMException | SyntaxError | ApiError>  => {
    // constructing a new URL so that we don't modify the input
    const url = newURL(urlArg)
    if(url instanceof TypeError) {
        return url
    }
    url.pathname = `/v2/GetNotesOfPlace`
    url.searchParams.append("placeID", String(args.placeID))
    const response = await safeFetch(url)
    if(response instanceof Error) {
        return response
    }
    if(response.status != 200) {
        const t = await response.text()
        if(t instanceof Error) {
            return t;
        }
        return new ApiError(response.status, t)
    }
    const result = await response.json()
    if(result instanceof Error) {
        return result
    }

    return result // consider zod for runtime type checks
}

