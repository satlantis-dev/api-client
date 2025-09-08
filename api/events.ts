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

export enum RsvpStatus {
    Accepted = "accepted",
    Waitlisted = "waitlisted",
    Tentative = "tentative",
    Declined = "declined",
    Rejected = "rejected",
    Requested = "requested",
}

export type RsvpStatusType = `${RsvpStatus}`;
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
    location?: string;
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
    rsvpGatedEnabledAt: string | null;

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

    registrationQuestions: {
        questions: RegistrationQuestion[];
    };
}
// Event RSVP Interfaces
export interface EventRsvpItem {
    accountId: number;
    rsvpId: number;
    picture: string;
    displayName: string;
    username: string;
    followersCount: number;
    email?: string;
    npub: string;
    rsvpStatus: "accepted" | "tentative" | "declined" | "waitlisted" | "requested" | "rejected";
    profileUrl: string;
    registrationTime: string;
    about: string;
    nip05: string;
}

export interface EventRsvpsResponse {
    items: EventRsvpItem[];
    total: number;
    rsvpDeclinedCount: number;
    rsvpAcceptedCount: number;
    rsvpWaitlistedCount: number;
    rsvpInvitedCount: number;
    rsvpTentativeCount: number;
    rsvpRequestedCount: number;
    rsvpRejectedCount: number;
}

export interface GetEventRsvpsArgs {
    eventId?: string;
    status?: string;
    page: number;
    limit: number;
    sort_by?: string;
    sort_order?: string;
    search?: string;
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
    destination?: string;
    place_id?: number;
    type?: string;
    period?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
    my_events?: string;
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

export const getEventRsvps = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    args: GetEventRsvpsArgs,
): Promise<EventRsvpsResponse | Error> => {
    const url = copyURL(urlArg);
    const jwtToken = getJwt();
    let headers;
    if (jwtToken !== "") {
        headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    url.pathname = `/secure/events/${args.eventId}/rsvps`;

    const queryParams = { ...args };
    delete queryParams.eventId;

    Object.keys(queryParams).forEach((key) => {
        if (!!(queryParams as any)[key]) {
            url.searchParams.set(key, (queryParams as any)[key]);
        }
    });

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });

    if (response instanceof Error) {
        return response;
    }

    return handleResponse<EventRsvpsResponse>(response);
};

export interface UpdateRsvpStatusItem {
    id: number;
    status: "accepted" | "tentative" | "declined" | "waitlisted" | "requested" | "rejected";
}

export interface UpdateRsvpStatusRequest {
    items: UpdateRsvpStatusItem[];
}

export interface UpdateRsvpStatusResultItem {
    id: number;
    success: boolean;
    error?: string;
}

export interface UpdateRsvpStatusResponse {
    results: UpdateRsvpStatusResultItem[];
}

export const updateRsvpStatus = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    items: UpdateRsvpStatusItem[],
): Promise<UpdateRsvpStatusResponse | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/rsvps/status`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    if (jwtToken !== "") {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const payload: UpdateRsvpStatusRequest = { items };

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });

    if (response instanceof Error) {
        return response;
    }

    return handleResponse<UpdateRsvpStatusResponse>(response);
};
export interface GetRandomizedEventsArgs {
    placeId?: number;
    type?: number;
    interests?: string;
    search?: string;
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
    placeId?: number;
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
    placeId?: number;
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
    placeId?: number;
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
    placeId?: number;
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

export type RegistrationQuestion = {
    label: string;
    required: boolean;
    answerType: AnswerType;
    options?: string[];
};

export enum AnswerType {
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
