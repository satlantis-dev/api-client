import { Aborted, FetchResult } from "./safe-fetch.ts";

export class ApiError extends Error {
    constructor(public readonly status: number, public readonly text: string) {
        super(`status ${status}, body ${text}`);
        this.name = ApiError.name;
    }
}

export class InvalidURL extends Error {
    constructor(public readonly url: string) {
        super(url);
        this.name = InvalidURL.name;
    }
}

export class InvalidJSON extends Error {
    constructor(public readonly source: SyntaxError) {
        super(source.message, { cause: source });
        this.name = InvalidJSON.name;
    }
}

export function newURL(url: string | URL) {
    try {
        return new URL(url);
    } catch (e) {
        // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#exceptions
        return new InvalidURL(url.toString());
    }
}

export function copyURL(url: URL) {
    return new URL(url);
}

export async function handleResponse<T extends {}>(response: FetchResult) {
    const body = await response.text();
    if (body instanceof Aborted) {
        return body;
    }
    if (response.status != 200) {
        return new ApiError(response.status, body);
    }
    const result = parseJSON<T>(body);
    if (result instanceof InvalidJSON) {
        return result;
    }
    return result as T;
}

function parseJSON<T extends {}>(text: string) {
    try {
        return JSON.parse(text) as T;
    } catch (e) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#exceptions
        return new InvalidJSON(e as SyntaxError);
    }
}
