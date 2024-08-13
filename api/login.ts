import { prepareNostrEvent, Signer } from "@blowater/nostr-sdk";
import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import { Account } from "./secure/account.ts";

/**
 * @unstable The signature is subject to change
 */
export const loginNostr = (urlArg: URL) => async (signer: Signer) => {
    const url = copyURL(urlArg);
    url.pathname = `/login/nostr`;
    const response = await safeFetch(
        url,
        {
            method: "POST",
            body: JSON.stringify(
                await prepareNostrEvent(signer, {
                    // @ts-ignore
                    kind: 27236,
                    content: "{}",
                    tags: [[
                        "auth",
                        "satlantis",
                    ]],
                }),
            ),
        },
    );
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        token: string;
        account: Account;
    }>(response);
};
