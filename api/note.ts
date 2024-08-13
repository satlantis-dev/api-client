import { CalendarEventRSVP } from "./calendar.ts";
import { ChatMembership } from "./chat.ts";
import { Account } from "./secure/account.ts";
import { NostrEvent, Reaction } from "./share_types.ts";

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
    descendants: Note[];
    depth: number;
    descendantId: number;
    eventId: number;
    event: NostrEvent;
    type: NoteType;
    reactions: Reaction[];
    repostedNoteId?: number;
    reposts: unknown[];
    zaps: unknown[];
};
