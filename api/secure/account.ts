import { type NostrEvent, NostrKind, prepareNostrEvent } from "@blowater/nostr-sdk";

import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { AccountPlaceRole, AccountPlaceRoleTypeEnum } from "../../models/account.ts";
import type { Account, AccountSearchDTO, func_GetJwt, func_GetNostrSigner } from "../../sdk.ts";

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

export const blacklistAccount = (urlArg: URL, getJwt: () => string) => async (args: { npub: string }) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/blacklistAccount/${args.npub}`;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    const response = await safeFetch(url, {
        method: "PUT",
        headers,
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

export const resendEmailVerification = (urlArg: URL, getJwt: () => string) => async () => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/resendEmailVerification`;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    const response = await safeFetch(url, { headers });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ success: boolean }>(response);
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

export const updateAccount = (urlArg: URL, getJwt: func_GetJwt) =>
async (args: {
    npub: string;
    data: {
        event: NostrEvent<NostrKind.META_DATA>;
        about?: string;
        banner?: string;
        displayName?: string;
        lud06?: string;
        lud16?: string;
        name?: string;
        picture?: string;
        phone?: string;
        website?: string;
        isBusiness?: boolean;
    };
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
        body: JSON.stringify(args.data),
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Account>(response);
};

export const getAccountsBySearch = (urlArg: URL, getJwt: func_GetJwt) =>
async (args: {
    username?: string;
    limit?: number;
    page?: number;
}, options?: {
    signal: AbortSignal;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/getAccountsBySearch`;
    if (args.username) {
        url.searchParams.set("username", args.username);
    }
    if (args.limit) {
        url.searchParams.set("limit", args.limit.toString());
    }
    if (args.page) {
        url.searchParams.set("page", args.page.toString());
    }

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        headers,
        signal: options?.signal,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<AccountSearchDTO[]>(response);
};

export const deleteAccount =
    (urlArg: URL, getJwt: func_GetJwt, getSigner: func_GetNostrSigner) => async () => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const signer = await getSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/deleteAccount`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const kind0 = await prepareNostrEvent(signer, {
            kind: NostrKind.META_DATA,
            content: "{}",
        });
        if (kind0 instanceof Error) {
            return kind0;
        }

        const body = JSON.stringify({
            event: kind0,
        });

        const response = await safeFetch(url, {
            method: "DELETE",
            body,
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        const responseBody = await response.text();
        if (responseBody instanceof Error) {
            return responseBody;
        }
        if (response.status == 200) {
            return true;
        }
        return false;
    };
