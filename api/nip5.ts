import { copyURL, handleResponse, InvalidJSON, InvalidURL, newURL } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import { Location, LocationTag } from "./share_types.ts";

export const nip5 = async (args: {
    domain: string
    name: string
}) => {
    const url = newURL(args.domain);
    if(url instanceof InvalidURL) {
        return url;
    }
    url.pathname = `/.well-known/nostr.json`;
    url.searchParams.append("name", args.name)
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{[key: string]: string[]}[]>(response);
};
