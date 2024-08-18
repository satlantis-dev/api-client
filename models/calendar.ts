import type { Note, ReshapedNostrEvent } from "../sdk.ts";

import type { Account } from "./account.ts";

export interface CalendarEventRSVP {
    id: number;
    accountId: number;
    account: Account;
    eventId: number;
    event: ReshapedNostrEvent;
    status: string;
}

export type CalendarEvent = {
    aTag: string;
    dTag: string;
    accountId: number;
    account: Account;
    calendarEventRsvps: CalendarEventRSVP[];
    placeId?: number;
    cost?: number;
    currency?: string;
    start: Date;
    end?: Date;
    startTimezone?: string;
    endTimezone?: string;
    description: string;
    image: string;
    location?: string;
    noteId: number;
    note: Note;
    geohash?: string;
    title: string;
    type: CalendarEventType;
    url: string;
};

export enum CalendarEventType {
    Conference = 1,
    Meetup,
    Hackathon,
    Concert,
    Workshop,
    Party,
    Play,
    Sports,
    Exhibition,
    Festival,
    Music,
    Other,
}
