import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { VanityPath } from "../models/vanity.ts";

export type GetVanityPathMappingArgs = {
    path: string;
};

export const getVanityPathMapping = (urlArg: URL) => async (args: GetVanityPathMappingArgs) => {
    const url = copyURL(urlArg);
    url.pathname = `/vanity/${args.path}`;

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    const note = await handleResponse<VanityPath>(response);
    if (note instanceof Error) {
        return note;
    }
    return note;
};
