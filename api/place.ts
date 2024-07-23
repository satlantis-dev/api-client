import { ApiError, copyURL, handleResponse } from "../_helper.ts";
import { safeFetch } from "../safe-fetch.ts";
import { IPlace, IPlaceNote } from "./share_types.ts";

/**
 * get the place based on OSM ID or ID, only 1 is needed
 */
export const getPlace = (urlArg: URL) =>
async (args: {
    osmRef: string | number;
}): Promise<IPlace | TypeError | DOMException | SyntaxError | ApiError> => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlace/${args.osmRef}`;
    const response = await safeFetch(url);
    return handleResponse<IPlace>(response);
};

/**
 * return a list of notes that associates with this place
 */
export const getPlaceNotes = (urlArg: URL) =>
async (args: {
    placeID: number;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceNotes/${args.placeID}`;
    const response = await safeFetch(url);
    return handleResponse<IPlaceNote[]>(response);
};
