import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import { Account } from "./secure/account.ts";

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
