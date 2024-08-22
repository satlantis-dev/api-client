import type { UnsignedNostrEvent } from "@blowater/nostr-sdk";
import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Account, func_GetJwt } from "../sdk.ts";

export const signEvent = (urlArg: URL, getJwt: func_GetJwt) =>
    async (args: UnsignedNostrEvent) => {
        const url = copyURL(urlArg);
        url.pathname = `/secure/signEvent`;
        const response = await safeFetch(url, {
            method: "POST",
            body: JSON.stringify(args),
            headers: new Headers({
                "Authorization": `Bearer ${getJwt()}`
            })
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<Account>(response);
    };
