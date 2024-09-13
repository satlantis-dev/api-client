import type { NostrEvent } from "@blowater/nostr-sdk";

import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import { type Note, NoteType } from "../note.ts";

export type ReactionPost = {
    accountId: number;
    chatNoteId?: number;
    event: NostrEvent;
    parentId: number;
    noteType: NoteType;
    noteId: number;
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

export type PostNoteResult = {
    id: number;
    accountId: number;
    ancestorId: number;
    descendants: Note[];
    eventId: number;
    event: {
        id: number;
        nostrId: string;
        createdAt: number;
        content: string;
        kind: number;
        pubkey: string;
        sig: string;
        tags: string[][];
        reconciled: boolean;
    };
    type: NoteType;
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
    return handleResponse<PostNoteResult>(response);
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
