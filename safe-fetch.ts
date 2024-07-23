export type FetchResult = {
    headers: Headers;
    status: number;
    text: () => Promise<string | DOMException | TypeError>;
    json: () => Promise<object | DOMException | TypeError | SyntaxError>;
};

export async function safeFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
): Promise<DOMException | TypeError | FetchResult> {
    let response: Response;
    try {
        response = await fetch(input, init);
    } catch (e) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#exceptions
        if (e instanceof DOMException) {
            return e as DOMException;
        } else if (e instanceof TypeError) {
            return e as TypeError;
        }
        throw e; // impossible according to MDN, caller should not handle
    }
    return {
        headers: response.headers,
        status: response.status,
        text: async () => {
            try {
                return response.text();
            } catch (e) {
                // https://developer.mozilla.org/en-US/docs/Web/API/Response/text#exceptions
                if (e instanceof DOMException) {
                    return e as DOMException;
                } else if (e instanceof TypeError) {
                    return e as TypeError;
                }
                throw e; // impossible according to MDN, caller should not handle
            }
        },
        json: async () => {
            try {
                return response.json();
            } catch (e) {
                // https://developer.mozilla.org/en-US/docs/Web/API/Response/json#exceptions
                if (e instanceof DOMException) {
                    return e as DOMException;
                } else if (e instanceof TypeError) {
                    return e as TypeError;
                } else if (e instanceof SyntaxError) {
                    return e as SyntaxError;
                }
                throw e; // impossible according to MDN, caller should not handle
            }
        },
    };
}
