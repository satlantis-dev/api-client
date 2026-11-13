import type { Interest, Location, Note, Place } from "../sdk.ts";
import type { AccountDTO, AccountMiniDTO } from "./account.ts";
import type { Community } from "./community.ts";
import type { CalendarEventTag } from "./event.ts";
import type { EventRegistrationAnswer } from "../api/secure/calendar.ts";

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
    // Answers to the event's registration questions, when the guest gave any.
    registrationAnswers?: { answers?: EventRegistrationAnswer[] } | null;
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

export type CalendarEventCohostRole = "admin" | "staff";

export type Cohost = {
    account: AccountDTO;
    accountId: number;

    calendarEventId: number;
    createdAt: string;
    id: number;
    invitationAcceptedAt: string | null;
    invitationDeclinedAt: string | null;
    role?: CalendarEventCohostRole;
    type?: CalendarEventCohostRole;
    updatedAt: string;
};
// Whom a guest follows when they register: nobody, the owner, or the owner plus admin cohosts and speakers.
export type CalendarEventAutoFollow = "none" | "owner" | "owner_cohosts_speakers";

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
    /** Name of the Google location (`googleId`) in event lists; absent when unknown or hidden. */
    locationName?: string;
    locationClarification?: string | null;
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
    typeId?: number;
    url: string;
    website: string;
    googleId?: string;
    autoFollow: CalendarEventAutoFollow;
    isOrganizer: boolean;
    accountStripeConnectId?: number | null;
    contactEmail?: string;
    isOnline?: boolean;
    // Ticketing/RSVP handled on another website (`website`); RSVP confirmation emails are skipped.
    isExternallyManaged: boolean;
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
    upcomingEventCount?: number;
    isPublic: boolean;
    featured: boolean;
    place?: Place;
    placeId?: number;
    contributors?: AccountDTO[];
    numSubscriptions: number;
    createdAt: string;
    updatedAt: string;
    communityId?: number;
    community?: Community;
};

/**
 * The trimmed calendar shape the list endpoints return (discover, an account's calendars and
 * subscriptions). Single-calendar endpoints return `Calendar`.
 */
export type CalendarDTO = {
    id: number;
    account_id: number;
    /** The calendar owner. */
    owner?: AccountMiniDTO;
    name: string;
    description: string;
    slug: string;
    banner: string;
    createdAt: string;
    /** Absent from api builds older than the field. */
    updatedAt?: string;
    eventCount: number;
    upcomingEventCount?: number;
    eventTags?: CalendarEventTag[];
    numSubscriptions: number;
    placeId?: number;
    isPublic: boolean;
    featured: boolean;
    communityId?: number;
};

export interface CalendarEventSubmission {
    calendarId: number;
    event: CalendarEvent;
    submitter: AccountDTO;
}

export enum AccountCalendarRoleType {
    CalendarOwner = 1,
    CalendarContributor,
    CalendarViewer,
    CalendarInvited,
}

export type AccountCalendarRole = {
    accountId: number;
    account?: AccountDTO;
    calendarId: number;
    calendar?: Calendar;
    type: AccountCalendarRoleType;
    createdAt: string;
    updatedAt: string;
};
