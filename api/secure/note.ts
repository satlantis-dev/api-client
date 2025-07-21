import type { NostrEvent, NostrKind } from "@blowater/nostr-sdk";

import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import { type Note, NoteType } from "../note.ts";
import type { Account } from "../../models/account.ts";

export type ReactionPost = {
    accountId: number;
    chatNoteId?: number;
    event: NostrEvent;
    parentId: number;
    noteType: NoteType;
    noteId: number;
};

export type RecordNotesAsSeenPost = {
    noteIds: number[];
};

export interface NotePost {
    event: NostrEvent;
    noteType: NoteType;
    locationId?: number;
    noteId?: number;
    placeId?: number;
    accountId?: number;
    parentId?: number;
    repostedNoteId?: number;
}

export const deleteNote = (urlArg: URL, getJwt: () => string) => async (args: NotePost) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/deleteNote`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const body = JSON.stringify(args);

    const response = await safeFetch(url, {
        method: "POST",
        body,
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<string>(response);
};

export const postNote = (urlArg: URL, getJwt: () => string) => async (args: NotePost) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/postNote`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const body = JSON.stringify(args);

    const response = await safeFetch(url, {
        method: "POST",
        body,
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Note>(response);
};

export const postReaction = (urlArg: URL, getJwt: () => string) => async (args: ReactionPost) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/postReaction`;

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
    return handleResponse<{
        id: number;
        accountId: number;
        eventId: number;
        noteId: number; // the id of the note that it is reacting to
    }>(response);
};

export const recordNotesAsSeen =
    (urlArg: URL, getJwt: () => string) => async (args: RecordNotesAsSeenPost) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/recordNotesAsSeen`;

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
        return handleResponse<{ status: string }>(response);
    };
