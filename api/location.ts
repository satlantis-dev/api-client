import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import { LocationTag, PlaceEvent } from "./share_types.ts";

export const getLocationTags = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationTags`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<LocationTag[]>(response);
};
