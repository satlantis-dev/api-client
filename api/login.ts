import { prepareNormalNostrEvent, Signer } from "@blowater/nostr-sdk";
import { copyURL, handleResponse } from "../_helper.ts";
import { safeFetch } from "../safe-fetch.ts";
import { Account } from "./share_types.ts";

export const loginNostr = (urlArg: URL) => async (signer: Signer) => {
    const url = copyURL(urlArg);
    url.pathname = `/login/nostr`;
    const response = await safeFetch(
        url,
        {
            method: "POST",
            body: JSON.stringify(
                await prepareNormalNostrEvent(signer, {
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
