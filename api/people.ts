import { copyURL, handleResponse } from "../_helper.ts";
import { safeFetch } from "../safe-fetch.ts";
import { AccountPlaceRole } from "./share_types.ts";

export const getAccountPlaceRoles = (urlArg: URL) =>
async (args: {
    placeID: number;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPeopleOfPlace/${args.placeID}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<AccountPlaceRole[]>(response);
};
