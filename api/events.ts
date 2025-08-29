import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { AccountDTO } from "../models/account.ts";
import type {
    CalendarEventAnnouncement,
    CalendarEventNote,
    CalendarEventRSVP,
    CalendarEventType,
    Cohost,
    EventInterest,
} from "../models/calendar.ts";
import type { LocationDTO } from "../models/location.ts";
import type { BoundingBox, Place } from "../models/place.ts";
import type { PlaceEvent } from "../models/place.ts";
import type { func_GetJwt } from "@satlantis/api-client";
export interface EventDetails {
    id: number;
    accountId: number;
    account: AccountDTO;
    announcements: CalendarEventAnnouncement[];
    atag: string;
    createdAt: string;
    calendarEventRsvps: CalendarEventRSVPExtended[];
    content: string;
    dtag: string;
    end: string;
    endTzId: string;
    eventId: number;
    event: PlaceEvent;
    geohash: string;
    image: string;
    interests: EventInterest[];
    kind: number;
    nostrId: string;
    notes: CalendarEventNote[];
    pubkey: string;
    sig: string;
    start: string;
    startTzId: string;
    summary: string;
    tags: string;
    title: string;
    typeId: number;
    type: CalendarEventType;
    url: string;
    website: string;
    isSatlantisCreated: boolean;
    googleId: string;
    venueId: number | null;
    venue: LocationDTO;
    rsvpWaitlistedCount: number;
    rsvpWaitlistEnabledAt: string | null;
    rsvpAcceptedCount: number;

    cohosts: Cohost[];
    ownershipChangedAt: string | null;
    rsvpLimit: number | null;
    place: {
        banner: string;
        boundingBox: BoundingBox;
        id: number;
        name: string;
        osmRef: string;
    };
    country: {
        code: string;
        name: string;
    };
}

/**
 * Extended RSVP with notification tracking and Satlantis flags
 */
export interface CalendarEventRSVPExtended extends CalendarEventRSVP {
    kind: number;
    NotificationWeekSent: boolean;
    NotificationDaySent: boolean;
    NotificationHourSent: boolean;
    IsSatlantisCreated: boolean;
}

export const getEventDetails =
    (urlArg: URL) => async (args: { eventId: string }): Promise<EventDetails | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/events/${args.eventId}`;

        const headers = new Headers();

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<EventDetails>(response);
    };

export interface GetEventsArgs {
    destination?: string; // Filter by country or place name (partial match)
    place_id?: number; // Filter by place id
    type?: string; // Filter by event type (e.g., "concert", "meetup")
    period?: string; // Time filter: "upcoming" (default) or "past"
    search?: string; // Keyword search across title, description, venue, location
    start_date?: string; // Events starting from date (YYYY-MM-DD, inclusive)
    end_date?: string; // Events ending by date (YYYY-MM-DD, inclusive)
    my_events?: string; // Show only user's events if it's true(requires auth token)
    page: number;
    limit: number;
}

export const getEvents = (urlArg: URL) => async (args: GetEventsArgs): Promise<EventDetails[] | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/events`;
    Object.keys(args).forEach((key) => {
        url.searchParams.set(key, (args as any)[key]);
    });

    const headers = new Headers();

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<EventDetails[]>(response);
};

export interface GetRandomizedEventsArgs {
    placeId?: number; // Filter by place id
    type?: number; // Filter by event type id
    interests?: string; // filter by interests id (comma separated)
    search?: string; // Keyword search across title, description, venue, location
}

export const getRandomizedEvents =
    (urlArg: URL) => async (args: GetRandomizedEventsArgs): Promise<EventDetails[] | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/getEventsRandomized`;
        Object.keys(args).forEach((key) => {
            if (!!(args as any)[key]) {
                url.searchParams.set(key, (args as any)[key]);
            }
        });

        const headers = new Headers();

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<EventDetails[]>(response);
    };

export interface GetPopularEventsArgs {
    placeId?: number; // Filter by place id
}

export const getPopularEvents =
    (urlArg: URL) => async (args: GetPopularEventsArgs): Promise<EventDetails[] | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/getPopularEvents`;
        Object.keys(args).forEach((key) => {
            if (!!(args as any)[key]) {
                url.searchParams.set(key, (args as any)[key]);
            }
        });

        const headers = new Headers();

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<EventDetails[]>(response);
    };

export interface GetNewestEventsArgs {
    placeId?: number; // Filter by place id
}

export const getNewestEvents =
    (urlArg: URL) => async (args: GetNewestEventsArgs): Promise<EventDetails[] | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/getNewestEvents`;
        Object.keys(args).forEach((key) => {
            if (!!(args as any)[key]) {
                url.searchParams.set(key, (args as any)[key]);
            }
        });

        const headers = new Headers();

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<EventDetails[]>(response);
    };

export interface GetFeaturedEventsArgs {
    placeId?: number; // Filter by place id
}

export const getFeaturedEvents =
    (urlArg: URL) => async (args: GetFeaturedEventsArgs): Promise<EventDetails[] | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/getFeaturedEvents`;
        Object.keys(args).forEach((key) => {
            if (!!(args as any)[key]) {
                url.searchParams.set(key, (args as any)[key]);
            }
        });

        const headers = new Headers();

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<EventDetails[]>(response);
    };

export interface GetRecommendedEventsArgs {
    placeId?: number; // Filter by place id
}

export const getRecommendedEvents =
    (urlArg: URL, getJwt: func_GetJwt) =>
    async (args: GetRecommendedEventsArgs): Promise<EventDetails[] | Error> => {
        const url = copyURL(urlArg);
        const jwtToken = getJwt();
        let headers;
        if (jwtToken !== "") {
            headers = new Headers();
            headers.set("Authorization", `Bearer ${jwtToken}`);
        }
        url.pathname = `/secure/getRecommendedEvents`;
        Object.keys(args).forEach((key) => {
            if (!!(args as any)[key]) {
                url.searchParams.set(key, (args as any)[key]);
            }
        });

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<EventDetails[]>(response);
    };

export const saveRegistrationQuestions = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
    questions: RegistrationQuestion[],
): Promise<{ success: boolean; message: string } | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${eventId}/questions`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const payload = { questions };

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        success: boolean;
        message: string;
    }>(response);
};

type RegistrationQuestion = {
    label: string;
    required: boolean;
    question_type: QuestionType;
    options?: string[];
};

export enum QuestionType {
    AgreeCheck = "agree-check",
    Text = "text",
    LongText = "long-text",
    Url = "url",
    Email = "email",
    Phone = "phone",
    Npub = "npub",
    Insta = "insta",
    X = "x",
    Facebook = "facebook",
}
