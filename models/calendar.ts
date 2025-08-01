import type { Interest, Location, LocationResolver, Note, Place } from "../sdk.ts";
import type { AccountDTO } from "./account.ts";

export interface CalendarEventRSVP {
    id: number;
    accountId: number;
    account: AccountDTO;
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

export type EventInterest = {
    id: number;
    name: string;
};

export type Cohost = {
    account: AccountDTO;
    accountId: number;

    calendarEventId: number;
    createdAt: string;
    id: number;
    invitationAcceptedAt: string | null;
    invitationDeclinedAt: string | null;
    updatedAt: string;
};
export type CalendarEvent = {
    id: number;
    atag: string;
    placeId: number;
    interests: Interest[];
    accountId: number;
    account: AccountDTO;
    cohosts: Cohost[];
    announcements: CalendarEventAnnouncement[];
    calendarEventRsvps: CalendarEventRSVP[];
    content: string;
    createdAt: string;
    dtag: string;
    end: string;
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
    start: string;
    startTzId?: string;
    summary: string;
    tags: string;
    title: string;
    venue?: Location;
    type: CalendarEventType;
    url: string;
    website: string;
    googleId?: string;
    autoFollowHosts?: boolean;
};

export type PlaceCalendarEvent = {
    id: number;
    createdAt: string;
    placeId: number;
    calendarEventId: number;
    calendarEvent: CalendarEvent;
};

export type CalendarEventType = {
    id: number;
    name: string;
    description: string;
};
export enum CalendarEventPeriod {
    Upcoming = "upcoming",
    Past = "past",
}
