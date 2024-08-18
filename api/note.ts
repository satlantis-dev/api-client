import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Account } from "../models/account.ts";
import type { CalendarEventRSVP } from "../models/calendar.ts";
import type { ChatMembership } from "../models/chat.ts";

import type { Reaction, ReshapedNostrEvent } from "./share_types.ts";

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
    id: number;
    accountId: number;
    account: Account;
    ancestorId: number;
    calendarEventRsvps: CalendarEventRSVP[];
    chatMemberships: ChatMembership[];
    depth: number;
    descendantId: number;
    eventId: number;
    event: ReshapedNostrEvent;
    type: NoteType;
    reactions: Reaction[];
    repostedNoteId?: number;
    reposts: unknown[];
    zaps: unknown[];
};

export const getNotes = (urlArg: URL) =>
async (args: {
    npub: string;
    page: number;
    limit: number;
}) => {
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

export const getNote = (urlArg: URL) => async (args: { noteID: number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getNote/${args.noteID}`;

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    const notes = await handleResponse<Note[]>(response);
    if (notes instanceof Error) {
        return notes;
    }
    if (notes.length == 0) {
        return undefined;
    }
    return {
        itself: notes[0],
        descendants: notes.slice(1),
    };
};
