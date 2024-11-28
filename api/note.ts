import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { AccountDTO } from "../models/account.ts";
import type { Reaction } from "../models/reaction.ts";
import type { func_GetJwt } from "../sdk.ts";

export interface PlaceNote {
    id: number;
    placeId: number;
    noteId: number;
    note: Note;
    type: NoteType;
}

export enum NoteType {
    BASIC = 1,
    REVIEW,
    GALLERY,
    PUBLIC_CHAT,
    PRIVATE_CHAT,
    CALENDAR_EVENT,
    CALENDAR,
    PING,
    REACTION,
    DELETE_NOTE,
    REPLY_NOTE,
    MEDIA,
}

export type Note = {
    readonly id: number;
    readonly accountId: number;
    readonly account: AccountDTO;
    readonly createdAt: string;
    readonly commentCount?: number;
    readonly commentedByUser?: boolean;
    readonly content: string;
    readonly eventId: number;
    readonly kind: number;
    readonly nostrId: string;
    readonly pubkey: string;
    readonly reactionCount?: number;
    readonly reactedByUser?: boolean;
    readonly sig: string;
    readonly source?: string;
    readonly score?: number;
    readonly tags: string;
    readonly type: number;
};

export const getNotesOfPubkey =
    (urlArg: URL) => async (args: { npub: string; page: number; limit: number }) => {
        const url = copyURL(urlArg);
        url.pathname = `/getNotes/${args.npub}`;
        url.searchParams.set("page", String(args.page));
        url.searchParams.set("limit", String(args.limit));

        const response = await safeFetch(url);
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<Note[]>(response);
    };

export const getNotes = (urlArg: URL, getJwt: func_GetJwt) =>
async (args: {
    page: number;
    limit: number;
    placeId?: string;
    sort?: "recent" | "trending";
    secure?: boolean;
    accountId?: number;
}) => {
    const url = copyURL(urlArg);
    const headers = new Headers();
    url.pathname = args.secure ? `/getFeedNotes` : `/getNotes`;
    url.searchParams.set("page", String(args.page));
    url.searchParams.set("limit", String(args.limit));
    if (args.placeId) {
        url.searchParams.set("place_id", String(args.placeId));
    }
    if (args.sort) {
        url.searchParams.set("sort", String(args.sort));
    }
    if (args.accountId) {
        url.searchParams.set("account_id", String(args.accountId));
    }

    if (args.secure) {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, { headers });
    console.log("response", response);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Note[]>(response);
};

export const getNote = (urlArg: URL) => async (args: { accountID?: number; noteID: number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getNote/${args.noteID}`;

    if (args.accountID) {
        url.searchParams.set("accountId", String(args.accountID));
    }

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    const note = await handleResponse<Note>(response);
    if (note instanceof Error) {
        return note;
    }
    return note;
};

export const getNoteReactionsById = (urlArg: URL) =>
async (args: {
    accountID?: number;
    noteID: number;
    page: number;
    limit: number;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getNoteReactions/${args.noteID}`;
    url.searchParams.set("page", String(args.page));
    url.searchParams.set("limit", String(args.limit));
    if (args.accountID) {
        url.searchParams.set("accountId", String(args.accountID));
    }
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Reaction[]>(response);
};

export const getNoteCommentsById = (urlArg: URL) =>
async (args: {
    accountID?: number;
    noteID: number;
    page: number;
    limit: number;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getNoteComments/${args.noteID}`;
    url.searchParams.set("page", String(args.page));
    url.searchParams.set("limit", String(args.limit));
    if (args.accountID) {
        url.searchParams.set("accountId", String(args.accountID));
    }
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Note[]>(response);
};
