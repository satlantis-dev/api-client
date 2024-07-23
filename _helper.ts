import { FetchResult } from "./safe-fetch.ts";

export class ApiError extends Error {
    constructor(public readonly status: number, public readonly text: string) {
        super(`status ${status}, body ${text}`);
        this.name = ApiError.name;
    }
}

export function newURL(url: string | URL) {
    try {
        return new URL(url);
    } catch (e) {
        // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#exceptions
        return e as TypeError;
    }
}

export function copyURL(url: URL) {
    return new URL(url);
}

export async function handleResponse<T extends {}>(
    response: DOMException | TypeError | FetchResult,
) {
    if (response instanceof Error) {
        return response;
    }
    if (response.status != 200) {
        const t = await response.text();
        if (t instanceof Error) {
            return t;
        }
        return new ApiError(response.status, t);
    }
    const result = await response.json();
    if (result instanceof Error) {
        return result;
    }
    return result as T;
}
