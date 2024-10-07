import type { Note } from "../sdk.ts";

import type { Account } from "./account.ts";

export interface CalendarEventRSVP {
    id: number;
    accountId: number;
    account: Account;
    createdAt: string;
    content: string;
    eventId: number;
    nostrId: string;
    pubkey: string;
    sig: string;
    tags: string;
    calendarEventId: number;
    status: string;
}

export interface CalendarEventAnnouncement {
    id: number;
    calendarEventId: number;
    noteId: number;
    note: Note;
}

export interface CalendarEventNote {
    id: number;
    calendarEventId: number;
    noteId: number;
    note: Note;
}

export type CalendarEvent = {
    id: number;
    atag: string;
    accountId: number;
    account: Account;
    announcements: CalendarEventAnnouncement[];
    calendarEventRsvps: CalendarEventRSVP[];
    content: string;
    createdAt: string;
    dtag: string;
    end?: Date;
    endTzId?: string;
    eventId: number;
    geohash?: string;
    image: string;
    kind: number;
    location?: string;
    nostrId: string;
    notes: CalendarEventNote[];
    pubkey: string;
    sig: string;
    start: Date;
    startTzId?: string;
    summary: string;
    tags: string;
    title: string;
    type: string;
    url: string;
};

export type PlaceCalendarEvent = {
    id: number;
    createdAt: string;
    placeId: number;
    calendarEventId: number;
    calendarEvent: CalendarEvent;
};
