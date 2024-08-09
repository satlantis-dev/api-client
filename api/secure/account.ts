import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import { AccountPlaceRole, AccountPlaceRoleTypeEnum } from "../share_types.ts";
import { NostrKind, prepareNormalNostrEvent, Signer } from "@blowater/nostr-sdk";

export const addAccountRole =
    (urlArg: URL, jwtToken: string | undefined, getSigner: () => Signer | Error) =>
    async (args: {
        placeId: number;
        type: AccountPlaceRoleTypeEnum;
    }) => {
        if (jwtToken == undefined || jwtToken == "") {
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
                    event: await prepareNormalNostrEvent(signer, {
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
    (urlArg: URL, jwtToken: string | undefined, getSigner: () => Signer | Error) =>
    async (args: {
        placeId: number;
        type: AccountPlaceRoleTypeEnum;
    }) => {
        if (jwtToken == undefined || jwtToken == "") {
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
                    event: await prepareNormalNostrEvent(signer, {
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
