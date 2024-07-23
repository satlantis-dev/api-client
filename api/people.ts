import { copyURL, handleResponse } from "../_helper.ts";
import { safeFetch } from "../safe-fetch.ts";

export const getPeopleOfPlace = (urlArg: URL) =>
async (args: {
    osmRef: string;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getPeopleOfPlace/${args.osmRef}`;
    const response = await safeFetch(url);
    return handleResponse(response);
};
