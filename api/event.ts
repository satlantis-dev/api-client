import { copyURL, handleResponse } from "../_helper.ts";
import { safeFetch } from "../safe-fetch.ts";
import { PlaceEvent } from "./share_types.ts";

export const getPlaceEvent = (urlArg: URL) =>
async (args: {
    placeID: number;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPlaceEvent/${args.placeID}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<PlaceEvent>(response);
};

export const this_is_a_new_API = (urlArg: URL) =>
    async (args: {
        placeID: number;
    }) => {
        const url = copyURL(urlArg);
        url.pathname = `/this_is_a_new_API/${args.placeID}`;
        const response = await safeFetch(url);
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<PlaceEvent>(response);
    };
