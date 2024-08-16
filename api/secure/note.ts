import { NostrEvent, NostrKind } from "@blowater/nostr-sdk";
import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import { NoteType } from "../note.ts";

export type ReactionPost = {
    accountId: number;
    chatNoteId?: number;
    event: NostrEvent;
    parentId: number;
    noteType: NoteType;
    noteId: number;
};

export interface NotePost {
    placeId: number;
	event: NostrEvent;
    noteType: NoteType;
	accountId?: number;
	noteId?: number;
	parentId?: number;
	repostedNoteId?: number;
}

export const postNote = (urlArg: URL, getJwt: () => string) => async (args: NotePost) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/postNote`;

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
    return handleResponse<{ url: string }>(response);
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
    return handleResponse<{ url: string }>(response);
};
