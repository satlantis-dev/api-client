import { safeFetch } from "../helpers/safe-fetch.ts";
import { createSecureUrl, handleResponse } from "../helpers/util.ts";
import type { StripeAccount } from "../models/stripe.ts";
import type { func_GetJwt } from "../sdk.ts";

export type ConnectStripeAccountArgs = {
    redirectUrl: string;
};

export type ConnectStripeAccountResponse = {
    oauthUrl: string;
};

export function connectStripeAccount(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: ConnectStripeAccountArgs) => {
        const url = createSecureUrl(urlArg, `/stripe/connect/authorize`);
        url.searchParams.set("redirect_url", args.redirectUrl);

        const jwtToken = getJwt();
        const headers = new Headers();

        if (!jwtToken) return new Error("jwt token is empty");

        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<ConnectStripeAccountResponse>(response);
    };
}

export type DisconnectStripeAccountArgs = {
    // use StripeAccount.id
    id: number;
};

export type DisconnectStripeAccountResponse = {
    success: boolean;
    message: string;
};

export function disconnectStripeAccount(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: DisconnectStripeAccountArgs) => {
        const url = createSecureUrl(urlArg, `/stripe/connect/${args.id}`);

        const jwtToken = getJwt();
        const headers = new Headers();

        if (!jwtToken) return new Error("jwt token is empty");

        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<DisconnectStripeAccountResponse>(response);
    };
}

export function getAllStripeAccounts(urlArg: URL, getJwt: func_GetJwt) {
    return async () => {
        const url = createSecureUrl(urlArg, "/stripe/connects");

        const jwtToken = getJwt();
        const headers = new Headers();

        if (!jwtToken) return new Error("jwt token is empty");

        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<StripeAccount[]>(response);
    };
}

export type SetDefaultStripeAccountArgs = {
    id: string;
};

export type SetDefaultStripeAccountResponse = {
    success: boolean;
    message: string;
};

export function setDefaultStripeAccount(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: SetDefaultStripeAccountArgs) => {
        const url = createSecureUrl(urlArg, `/stripe/connect/${args.id}/default`);

        const jwtToken = getJwt();
        const headers = new Headers();

        if (!jwtToken) return new Error("jwt token is empty");

        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "PUT",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<SetDefaultStripeAccountResponse>(response);
    };
}
