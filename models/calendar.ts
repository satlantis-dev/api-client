import type { Interest, Location, Note, Place } from "../sdk.ts";
import type { AccountDTO } from "./account.ts";
import type { CalendarEventTag } from "./event.ts";

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
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    toDiscussion: boolean;
    toNostr: boolean;
    toEmail: boolean;
    toNotification: boolean;
    emailSubject?: string;
    emailRecipientIds: number[];
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
    placeId?: number;
    place: {
        id: number;
        name: string;
        osmRef: string;
    };
    interests: Interest[];
    accountId: number;
    account: AccountDTO;
    cohosts: Cohost[];
    isHidingAttendees?: boolean;
    announcements: CalendarEventAnnouncement[];
    content: string;
    createdAt: string;
    calendarEventRsvps?: CalendarEventRSVP[];
    dtag: string;
    end: string;
    endTzId?: string;
    eventId: number;
    geohash?: string;
    image: string;
    kind: number;
    knownAttendees?: AccountDTO[];
    sampleAttendees?: AccountDTO[];
    attendeeCount?: number;
    location?: string;
    nostrId: string;
    notes: CalendarEventNote[];
    pubkey: string;
    sig: string;
    isUnlisted?: boolean;
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
    isOrganizer: boolean;
    accountStripeConnectId?: number | null;
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

/**
 * https://github.com/satlantis-dev/models/blob/main/calendar.go#L9
 */
export type Calendar = {
    id: number;
    name: string;
    description: string;
    slug: string;
    banner: string;
    account_id: number;
    account?: AccountDTO;
    eventTags: CalendarEventTag[];
    events: CalendarEvent[] | null;
    eventCount: number;
    isPublic: boolean;
    featured: boolean;
    place?: Place;
    placeId?: number;
    contributors?: AccountDTO[];
    numSubscriptions: number;
    createdAt: string;
    updatedAt: string;
};

export interface CalendarEventSubmission {
    calendarId: number;
    event: CalendarEvent;
    submitter: AccountDTO;
}
