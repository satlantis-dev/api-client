import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { AccountDTO } from "../models/account.ts";
import type { Place } from "../models/place.ts";
import type { Reaction } from "../models/reaction.ts";
import type { func_GetJwt } from "../sdk.ts";

// https://github.com/satlantis-dev/models/blob/main/place_note.go#L7
export interface PlaceNote {
    id: number;
    placeId: number;
    noteId: number;
    note: Note;
    nsfw: boolean;
    type: NoteType;
    onSatlantis: boolean;
    isNews: boolean;
    reactions: number;
    replies: number;
    allReplies: number;
    score: number;
}

// https://github.com/satlantis-dev/models/blob/main/note.go#L7
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

// https://github.com/satlantis-dev/models/blob/main/note.go#L24
export type Note = {
    readonly id: number;
    readonly accountId: number;
    readonly account: AccountDTO;
    readonly createdAt: string;
    readonly content: string;
    readonly eventId: number;
    readonly kind: number;
    readonly nostrId: string;
    readonly pubkey: string;
    readonly sig: string;
    readonly tags: string;
    readonly type: NoteType;
    readonly repostedNoteId: number;
    readonly repostedNote: Note;
    readonly createdOnSatlantis: boolean;
};

export interface FeedNote extends Note {
    readonly source: string;
    readonly score: number;
    readonly commentCount: number; // next level comments
    readonly allCommentCount: number; // all level comments
    readonly reactionCount: number;
    readonly notableReactionCount: number;
    readonly reactedByAccounts: AccountDTO[];
    readonly repostCount: number;
    readonly repostedByAccounts: AccountDTO[];
    readonly commentedByUser: boolean;
    readonly reactedByUser: boolean;
    readonly place: Place;
}

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
        return handleResponse<FeedNote[]>(response);
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
    url.pathname = args.secure ? `/secure/getFeedNotes` : `/getNotes`;
    url.searchParams.set("page", String(args.page));
    url.searchParams.set("limit", String(args.limit));
    if (args.placeId) {
        url.searchParams.set("place_id", String(args.placeId));
    }
    if (args.sort) {
        url.searchParams.set("sort", String(args.sort));
    }
    if (args.accountId) {
        url.searchParams.set("accountId", String(args.accountId));
    }

    if (args.secure) {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, { headers });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<FeedNote[]>(response);
};

export const buildGlobalFeed = (urlArg: URL, getJwt: func_GetJwt) =>
async (args: {
    secure?: boolean;
    accountId?: number;
    lastNoteId?: number;
}) => {
    const url = copyURL(urlArg);
    const headers = new Headers();
    url.pathname = "secure/buildGlobalFeed";

    if (args.secure) {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        headers,
        method: "POST",
        body: JSON.stringify({
            accountId: args.accountId,
            last_note_id: args.lastNoteId,
        }),
    });
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
    const note = await handleResponse<FeedNote>(response);
    if (note instanceof Error) {
        return note;
    }
    return note;
};

export const getNoteByNostrId = (urlArg: URL) => async (args: { nostrId: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getNoteByNostrId/${args.nostrId}`;

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    const note = await handleResponse<FeedNote>(response);
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
    return handleResponse<FeedNote[]>(response);
};
