import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import { PlaceEvent } from "../share_types.ts";

export const presign = (urlArg: URL, jwtToken: string | undefined) =>
async (args: {
    filename: string;
}) => {
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
