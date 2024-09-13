import type { NostrEvent, NostrKind } from "@blowater/nostr-sdk";
import { ApiError, copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Account } from "../models/account.ts";
import type { func_GetJwt } from "../sdk.ts";

export const getAccount = (urlArg: URL) => async (args: { npub: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getAccount/${args.npub}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Account>(response);
};

export const login = (urlArg: URL) => async (args: { username: string; password: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/login`;
    const response = await safeFetch(url, {
        method: "POST",
        body: JSON.stringify(args),
    });
    if (response instanceof Error) {
        return response;
    }
    const result = await handleResponse<{ account: Account; token: string }>(response);
    if (result instanceof ApiError) {
        if (result.status == 404) {
            return undefined;
        } else if (result.status == 401) {
            return "invalid password";
        }
    }
    return result;
};

export const createAccount =
    (urlArg: URL) => async (args: { username: string; password: string; email: string }) => {
        const url = copyURL(urlArg);
        url.pathname = `/createAccount`;
        const response = await safeFetch(url, {
            method: "POST",
            body: JSON.stringify(args),
        });
        if (response instanceof Error) {
            return response;
        }
        const res = await handleResponse<{ status: "success" }>(response);
        if (res instanceof Error) {
            return res;
        }
        if (res.status == "success") {
            return true;
        }
        return new Error("unexpected result", { cause: res });
    };

export const initiatePasswordReset = (urlArg: URL) => async (args: { username: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/initiatePasswordReset`;
    const response = await safeFetch(url, {
        method: "PUT",
        body: JSON.stringify({
            username: `${args.username}`,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ success: boolean }>(response);
};

export const resetPassword = (urlArg: URL) => async (args: { token: string; password: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/resetPassword`;
    const response = await safeFetch(url, {
        method: "PUT",
        body: JSON.stringify({
            password: args.password,
            token: args.token,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ success: boolean }>(response);
};

export const verifyEmail = (urlArg: URL) => async (args: { token: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/verifyEmail/${args.token}`;
    const response = await safeFetch(url, { method: "PUT" });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ success: boolean }>(response);
};
