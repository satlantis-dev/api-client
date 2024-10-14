import type { NostrEvent, NostrKind } from "@blowater/nostr-sdk";
import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { func_GetJwt, func_GetNostrSigner } from "../../sdk.ts";

// https://github.com/satlantis-dev/api/blob/1a91e2503f5cb45cc7d2d889dbc7bfb13077d61d/rest/place.go#L25
export const postAmbassadorInquiry =
    (urlArg: URL, getJwt: func_GetJwt, getSigner: func_GetNostrSigner) =>
    async (args: {
        countryCode: string;
        placeName: string;
        kind4: NostrEvent<NostrKind.DIRECT_MESSAGE>;
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
        url.pathname = `/secure/postAmbassadorInquiry`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(
            url,
            {
                method: "POST",
                body: JSON.stringify(args),
                headers,
            },
        );
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<{}>(response);
    };
