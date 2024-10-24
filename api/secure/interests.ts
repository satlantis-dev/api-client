import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { Interest } from "../../models/interest.ts";

export const getInterests = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = `/interests`;

    const response = await safeFetch(url, {
        method: "GET",
    });
    if (response instanceof Error) {
        return response;
    }
    const results = await handleResponse<Interest[]>(response);
    if (results instanceof Error) {
        return results;
    }
    return results.filter((i) => i.name != "Default");
};
