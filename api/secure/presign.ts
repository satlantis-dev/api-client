import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { func_GetJwt, func_GetNostrSigner } from "../../sdk.ts";

export const presign = (urlArg: URL, getJwt: func_GetJwt, getSigner: func_GetNostrSigner) =>
async (args: {
    filename: string;
    directory?: string;
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
    url.pathname = `/secure/presign`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const newFileName = `${args.directory ? args.directory + "/" : ""}${
        signer.publicKey.bech32().replace("npub", "")
    }-${Date.now()}-${args.filename}`;
    const response = await safeFetch(url, {
        method: "POST",
        body: JSON.stringify({
            filename: newFileName,
        }),
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ url: string }>(response);
};
