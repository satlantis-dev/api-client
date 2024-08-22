import { ApiError, copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Account } from "../models/account.ts";

export const getAccount = (urlArg: URL) =>
async (args: {
    npub: string;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getAccount/${args.npub}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Account>(response);
};

export const login = (urlArg: URL) =>
async (args: {
    username: string;
    password: string;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/login`;
    const response = await safeFetch(url, {
        method: "POST",
        body: JSON.stringify(args),
    });
    if (response instanceof Error) {
        return response;
    }
    const result = await handleResponse<Account>(response);
    if (result instanceof ApiError) {
        if (result.status == 404) {
            return undefined;
        } else if (result.status == 401) {
            return "invalid password";
        }
    }
    return result;
};

export const createAccount = (urlArg: URL) =>
async (args: {
    username: string;
    password: string;
    email: string;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/createAccount`;
    const response = await safeFetch(url, {
        method: "POST",
        body: JSON.stringify(args),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Account>(response);
};
