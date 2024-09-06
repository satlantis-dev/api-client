import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";

type Interests = {
    readonly id: number;
    readonly name: string;
    readonly description: string;
    readonly recommendationsByNpub: string[] | null | undefined;
    readonly recommendationsById: null | undefined;
    readonly autofollowsByNpub: null | undefined;
    readonly autofollowsById: null | undefined;
    readonly hashtags: string[] | null | undefined;
};

export const getInterests = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = `/interests`;

    const response = await safeFetch(url, {
        method: "GET",
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Interests[]>(response);
};
