import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";

export const presign = (urlArg: URL, getJwt: () => string) =>
async (args: {
    filename: string;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/presign`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "POST",
        body: JSON.stringify(args),
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ url: string }>(response);
};
