import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import { AccountPlaceRole } from "./secure/account.ts";

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
