import { Note } from "./note.ts";
import { Account } from "./secure/account.ts";
import { NostrEvent } from "./share_types.ts";

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

export const getEventTypeUsingName = (id: string): CalendarEventType => {
    switch (id) {
        case "Conference":
            return CalendarEventType.Conference;
        case "Meetup":
            return CalendarEventType.Meetup;
        case "Hackathon":
            return CalendarEventType.Hackathon;
        case "Concert":
            return CalendarEventType.Concert;
        case "Workshop":
            return CalendarEventType.Workshop;
        case "Party":
            return CalendarEventType.Party;
        case "Play":
            return CalendarEventType.Play;
        case "Sports":
            return CalendarEventType.Sports;
        case "Exhibition":
            return CalendarEventType.Exhibition;
        case "Festival":
            return CalendarEventType.Festival;
        case "Music":
            return CalendarEventType.Music;
        default:
            return CalendarEventType.Other;
    }
};

export interface CalendarEventRSVP {
    id: number;
    accountId: number;
    account: Account;
    eventId: number;
    event: NostrEvent;
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

export function Hashtag(c: CalendarEventType) {
    const names = [
        "#conference",
        "#meetup",
        "#hackathon",
        "#concert",
        "#workshop",
        "#party",
        "#play",
        "#sports",
        "#exhibition",
        "#festival",
        "#music",
        "#other",
    ];

    if (c < CalendarEventType.Conference || c > CalendarEventType.Other) {
        return "Unknown";
    }

    return names[c - 1];
}
