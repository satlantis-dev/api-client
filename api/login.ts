import { prepareNostrEvent, type Signer } from "@blowater/nostr-sdk";

import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Account } from "../models/account.ts";

/**
 * @unstable The signature is subject to change
 */
export const loginNostr = (urlArg: URL) => async (signer: Signer) => {
    const url = copyURL(urlArg);
    url.pathname = `/login/nostr`;
    const body = JSON.stringify(
        await prepareNostrEvent(signer, {
            // @ts-ignore
            kind: 27236,
            content: "{}",
            tags: [["auth", "satlantis"]],
        }),
    );
    const response = await safeFetch(url, {
        method: "POST",
        body,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        token: string;
        account: Account;
    }>(response);
};
