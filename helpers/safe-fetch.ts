export type FetchResult = {
    headers: Headers;
    status: number;
    text: () => Promise<string | Aborted>;
};

export async function safeFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
) {
    let response: Response;
    try {
        response = await fetch(input, init);
    } catch (e) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#exceptions
        if (e instanceof DOMException) {
            if (e.name == "AbortError") {
                return new Aborted(e);
            }
        }
        throw e; // impossible according to our implementation, caller should not handle
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
                    if (e.name == "AbortError") {
                        return new Aborted(e);
                    }
                } else if (e instanceof TypeError) {
                    throw e; // impossible according to our implementation
                }
                throw e; // impossible according to MDN, caller should not handle
            }
        },
    };
}

export class Aborted extends Error {
    constructor(public readonly source: DOMException) {
        super(source.message, { cause: source });
        this.name = source.name;
    }
}
