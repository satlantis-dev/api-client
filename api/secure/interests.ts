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

export const getInterests = (urlArg: URL, getJwt: () => string) => async () => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/interests`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Interests[]>(response);
};
