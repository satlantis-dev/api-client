import { type NostrEvent, NostrKind, prepareNostrEvent, type Signer } from "@blowater/nostr-sdk";

import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { AccountPlaceRole, AccountPlaceRoleTypeEnum } from "../../models/account.ts";

export const addAccountRole =
    (urlArg: URL, getJwt: () => string, getSigner: () => Signer | Error) =>
    async (args: {
        placeId: number;
        type: AccountPlaceRoleTypeEnum;
    }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }
        const signer = getSigner();
        if (signer instanceof Error) {
            return signer;
        }
        const url = copyURL(urlArg);
        url.pathname = `/secure/addAccountRole`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(
            url,
            {
                method: "POST",
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

export const removeAccountRole =
    (urlArg: URL, getJwt: () => string, getSigner: () => Signer | Error) =>
    async (args: {
        placeId: number;
        type: AccountPlaceRoleTypeEnum;
    }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }
        const signer = getSigner();
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
    (urlArg: URL, getJwt: () => string, getSigner: () => Signer | Error) =>
    async (args: {
        event: NostrEvent<NostrKind.CONTACTS>;
    }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }
        const signer = getSigner();
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
