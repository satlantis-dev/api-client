import type { NostrEvent, NostrKind, UnsignedNostrEvent } from "@blowater/nostr-sdk";
import { ApiError, copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { func_GetJwt } from "../sdk.ts";

export const signEvent =
    (urlArg: URL, getJwt: func_GetJwt) => async <K extends NostrKind>(args: UnsignedNostrEvent<K>) => {
        const url = copyURL(urlArg);
        url.pathname = `/secure/signEvent`;
        const response = await safeFetch(url, {
            method: "POST",
            body: JSON.stringify(args),
            headers: new Headers({
                "Authorization": `Bearer ${getJwt()}`,
            }),
        });
        if (response instanceof Error) {
            return response;
        }
        const res = await handleResponse<NostrEvent<K>>(response);
        if (res instanceof ApiError) {
            if (res.status == 401) {
                return {
                    type: 401 as const,
                    data: res.message,
                };
            }
        }
        if (res instanceof Error) {
            return res;
        }
        return {
            type: true as true,
            data: res,
        };
    };

export const nip04Encrypt =
    (urlArg: URL, getJwt: func_GetJwt) => async (args: { pubKey: string; plaintext: string }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }
        const url = copyURL(urlArg);
        url.pathname = `/secure/nip04Encrypt`;
        const response = await safeFetch(url, {
            method: "POST",
            body: JSON.stringify(args),
            headers: new Headers({
                "Authorization": `Bearer ${jwtToken}`,
            }),
        });
        if (response instanceof Error) {
            return response;
        }
        const res = await handleResponse<string>(response);
        if (res instanceof Error) {
            return res;
        }
        return res;
    };
