import type { NostrEvent, Tag } from "@blowater/nostr-sdk";
import { Aborted, type FetchResult } from "../helpers/safe-fetch.ts";
import type { Note } from "../api/note.ts";

export class ApiError extends Error {
    constructor(public readonly status: number, public readonly text: string) {
        super(`status ${status}, body ${text}`);
        this.name = ApiError.name;
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
        return e as TypeError;
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
    if (!body) {
        return {} as T;
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

export const getRawNostrEventFromNote = (note: Note) => {
    // Parse note.tags (string) to NostrTools Tag[]
    const tags = note.tags ? JSON.parse(note.tags) : [];
    // Get timestamp from Date
    const createdAt = new Date(note.createdAt).getTime() / 1000;
    const nostrEvent: NostrEvent = {
        content: note.content,
        created_at: createdAt,
        id: note.nostrId,
        kind: note.kind,
        pubkey: note.pubkey,
        sig: note.sig,
        tags: tags as Tag[],
    };
    return nostrEvent;
};

export function bkdrHash(str: string): number {
    let hash = 0;
    const seed = 131;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * seed + str.charCodeAt(i)) >>> 0;
    }
    return hash;
}
