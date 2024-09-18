import type { NostrEvent } from "@blowater/nostr-sdk";
import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { Account, func_GetJwt } from "../../sdk.ts";

export const postCalendarEventRSVP = (urlArg: URL, getJwt: func_GetJwt) =>
async (args: {
    accountId: number;
    event: NostrEvent;
    noteId: number;
    status: string;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/postCalendarEventRSVP`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "POST",
        body: JSON.stringify(args),
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Account>(response);
};
