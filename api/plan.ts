import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Plan } from "../models/plan.ts";

export const getPlans = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = "/plans";

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }

    return handleResponse<Plan[]>(response);
};
