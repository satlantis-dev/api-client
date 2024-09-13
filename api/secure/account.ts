import { type NostrEvent, NostrKind, prepareNostrEvent } from "@blowater/nostr-sdk";

import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { AccountPlaceRole, AccountPlaceRoleTypeEnum } from "../../models/account.ts";
import type { Account, func_GetJwt, func_GetNostrSigner } from "../../sdk.ts";

export const addAccountRole =
    (urlArg: URL, getJwt: func_GetJwt, getSigner: func_GetNostrSigner) =>
    async (args: {
        placeId: number;
        type: AccountPlaceRoleTypeEnum;
    }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }
        const signer = await getSigner();
        if (signer instanceof Error) {
            return signer;
        }
        const url = copyURL(urlArg);
        url.pathname = `/secure/addAccountRole`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const event = await prepareNostrEvent(signer, {
            kind: 10016 as NostrKind,
            content: "",
        });
        if (event instanceof Error) {
            return event;
        }

        const response = await safeFetch(
            url,
            {
                method: "POST",
                body: JSON.stringify({
                    ...args,
                    event,
                }),
                headers,
            },
        );
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<AccountPlaceRole>(response);
    };

export const removeAccountRole =
    (urlArg: URL, getJwt: () => string, getSigner: func_GetNostrSigner) =>
    async (args: {
        placeId: number;
        type: AccountPlaceRoleTypeEnum;
    }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }
        const signer = await getSigner();
        if (signer instanceof Error) {
            return signer;
        }
        const url = copyURL(urlArg);
        url.pathname = `/secure/removeAccountRole`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        const response = await safeFetch(
            url,
            {
                method: "DELETE",
                body: JSON.stringify({
                    ...args,
                    event: await prepareNostrEvent(signer, {
                        kind: 10016 as NostrKind,
                        content: "",
                    }),
                }),
                headers,
            },
        );
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<AccountPlaceRole>(response);
    };

export const updateAccountFollowingList =
    (urlArg: URL, getJwt: () => string, getSigner: func_GetNostrSigner) =>
    async (args: {
        event: NostrEvent<NostrKind.CONTACTS>;
    }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }
        const signer = await getSigner();
        if (signer instanceof Error) {
            return signer;
        }
        const url = copyURL(urlArg);
        url.pathname = `/secure/updateAccountFollowingList`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        const response = await safeFetch(
            url,
            {
                method: "PUT",
                body: JSON.stringify(args.event),
                headers,
            },
        );
        if (response instanceof Error) {
            return response;
        }
        const ok = await handleResponse<string>(response);
        if (ok instanceof Error) return ok;

        return ok.toLowerCase() == "success";
    };

// Update account
interface IUpdateAccountPut {
    countryCode?: string;
    email?: string;
    kind0: NostrEvent<NostrKind.META_DATA>;
    phone?: string;
}

export const updateAccount = (urlArg: URL, getJwt: func_GetJwt) =>
async (args: {
    npub: string;
    account: Account | IUpdateAccountPut;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/updateAccount/${args.npub}`;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    const response = await safeFetch(url, {
        method: "PUT",
        body: JSON.stringify(args.account),
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ status: "success" }>(response);
};
