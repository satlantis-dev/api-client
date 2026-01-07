import type { func_GetJwt } from "@satlantis/api-client";
import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { OnboardingProfile } from "../../models/onboarding.ts";

export const getUserOnboardingProfile = (urlArg: URL, getJwt: func_GetJwt) => async () => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/user/onboarding`;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<OnboardingProfile>(response);
};

export const setHostFlag = (urlArg: URL, getJwt: func_GetJwt) => async (isHost: boolean) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/user/onboarding/host`;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ isHost }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{}>(response);
};
