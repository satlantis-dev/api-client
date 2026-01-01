import { ApiError, copyURL, InvalidJSON, parseJSON } from "./_helper.ts";
import { Aborted, type FetchResult } from "./safe-fetch.ts";

export const handleResponse = async <T extends {}>(response: FetchResult) => {
    const body = await response.text();
    if (body instanceof Aborted) {
        return body;
    }

    // 200-299 is success.
    if (response.status < 200 || response.status >= 300) {
        return new ApiError(response.status, body);
    }
    if (!body) {
        return {} as T;
    }
    const result = parseJSON<T>(body);
    if (result instanceof InvalidJSON) {
        return result;
    }
    return result as T;
};

export const createPublicUrl = (urlArg: URL, path: string) => {
    const url = copyURL(urlArg);
    url.pathname = path;
    return url;
};

export const createSecureUrl = (urlArg: URL, path: string) => {
    const url = copyURL(urlArg);
    url.pathname = `/secure${path}`;
    return url;
};
