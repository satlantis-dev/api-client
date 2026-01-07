import { type NostrEvent, NostrKind, prepareNostrEvent, type Tag } from "@blowater/nostr-sdk";
import type { func_GetJwt, func_GetNostrSigner } from "@satlantis/api-client";
import { copyURL, generateUUID, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { AccountDTO } from "../models/account.ts";
import type {
    Calendar,
    CalendarEventAnnouncement,
    CalendarEventNote,
    CalendarEventRSVP,
    CalendarEventType,
    Cohost,
} from "../models/calendar.ts";
import type { CalendarEventTag, EventUserTimeline } from "../models/event.ts";
import type { LocationDTO } from "../models/location.ts";
import type { BoundingBox, PlaceEvent } from "../models/place.ts";

export enum RsvpStatus {
    Accepted = "accepted",
    Waitlisted = "waitlisted",
    Tentative = "tentative",
    Declined = "declined",
    Rejected = "rejected",
    Requested = "requested",
    Invited = "invited",
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
    calendarEventTags: CalendarEventTag[];
    location?: string;
    kind: number;
    knownAttendees?: AccountDTO[];
    sampleAttendees?: AccountDTO[];
    attendeeCount?: number;
    nostrId: string;
    notes: CalendarEventNote[];
    officialCalendar?: Calendar;
    officialCalendarId?: number;
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
    featured: boolean;
    cohosts: Cohost[];
    ownershipChangedAt: string | null;
    rsvpLimit: number | null;
    place: EventDetailsPLace;
    country: {
        code: string;
        name: string;
    };

    registrationQuestions?: {
        questions: RegistrationQuestion[];
    };

    userTicket?: UserTicketEventDetails;
    isUnlisted: boolean;
}

export interface UserTicketEventDetails {
    accountId: number;
    createdAt: Date;
    id: number;
    status: string;
    ticketTypeId: number;
    ticketTypeName: string;
}

export interface EventDetailsPLace {
    banner: string;
    boundingBox: BoundingBox;
    id: number;
    name: string;
    osmRef: string;
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
    rsvpStatus: "accepted" | "tentative" | "declined" | "waitlisted" | "requested" | "rejected" | "invited";
    profileUrl: string;
    registrationTime: string;
    about: string;
    nip05: string;
    ticket: GetEventRsvpTicket;
    registrationAnswers: any;
}

export interface GetEventRsvpTicket {
    checkedInAt: null | Date;
    code: string;
    createdAt: string;
    id: number;
    orderItemId: number;
    status: string;
    ticketType: EventTicketType;
    ticketTypeId: number;
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
    options?: {
        signal: AbortSignal;
    };
}

export interface GetEventCalendarsArgs {
    eventId?: string | number;
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

export const getEventDetails = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    args: { eventId: string },
): Promise<EventDetails | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/events/${args.eventId}`;

    let headers;
    const jwtToken = getJwt();

    headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

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

export const getEvents = (urlArg: URL, getJwt?: () => string) =>
async (args: GetEventsArgs, options?: {
    signal: AbortSignal;
}): Promise<EventDetails[] | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/events`;
    Object.keys(args).forEach((key) => {
        url.searchParams.set(key, (args as any)[key]);
    });

    const headers = new Headers();
    if (getJwt) {
        const jwtToken = getJwt();
        if (jwtToken !== "") {
            headers.set("Authorization", `Bearer ${jwtToken}`);
        }
    }

    const response = await safeFetch(url, {
        method: "GET",
        headers,
        signal: options?.signal,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<EventDetails[]>(response);
};

export const getEventCalendars = (urlArg: URL) =>
async (
    args: GetEventCalendarsArgs,
): Promise<Calendar[] | Error> => {
    const url = copyURL(urlArg);

    url.pathname = `/events/${args.eventId}/calendars`;

    const queryParams = { ...args };
    delete queryParams.eventId;

    Object.keys(queryParams).forEach((key) => {
        if (!!(queryParams as any)[key]) {
            url.searchParams.set(key, (queryParams as any)[key]);
        }
    });

    const response = await safeFetch(url, {
        method: "GET",
    });

    if (response instanceof Error) {
        return response;
    }

    return handleResponse<Calendar[]>(response);
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

    const { eventId: _eventId, options: _options, ...queryParams } = args;
    for (const [key, value] of Object.entries(queryParams)) {
        if (value === undefined || value === null || value === "") continue;
        url.searchParams.set(key, String(value));
    }

    const response = await safeFetch(url, {
        method: "GET",
        headers,
        signal: args.options?.signal,
    });

    if (response instanceof Error) {
        return response;
    }

    return handleResponse<EventRsvpsResponse>(response);
};

export interface GetEventAttendeesArgs {
    eventId: string | number;
    status?: RsvpStatus.Accepted | RsvpStatus.Waitlisted | RsvpStatus.Tentative | RsvpStatus.Requested;
}

export const getEventAttendees = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    args: GetEventAttendeesArgs,
): Promise<AccountDTO[] | Error> => {
    const url = copyURL(urlArg);
    const jwtToken = getJwt();
    let headers;
    if (jwtToken !== "") {
        headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    url.pathname = `/secure/events/${args.eventId}/attendees`;

    if (args.status) {
        url.searchParams.set("status", args.status);
    }

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });

    if (response instanceof Error) {
        return response;
    }

    return handleResponse<AccountDTO[]>(response);
};

export interface UpdateRsvpStatusItem {
    id: number;
    status: "accepted" | "tentative" | "declined" | "waitlisted" | "requested" | "rejected" | "invited";
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
    (urlArg: URL, getJwt?: () => string) =>
    async (args: GetRandomizedEventsArgs): Promise<EventDetails[] | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/getEventsRandomized`;
        Object.keys(args).forEach((key) => {
            if (!!(args as any)[key]) {
                url.searchParams.set(key, (args as any)[key]);
            }
        });

        const headers = new Headers();

        if (getJwt) {
            const jwtToken = getJwt();
            if (jwtToken !== "") {
                headers.set("Authorization", `Bearer ${jwtToken}`);
                headers.set("Content-Type", "application/json");
            }
        }
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
    (urlArg: URL, getJwt?: () => string) =>
    async (args: GetPopularEventsArgs): Promise<EventDetails[] | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/getPopularEvents`;
        Object.keys(args).forEach((key) => {
            if (!!(args as any)[key]) {
                url.searchParams.set(key, (args as any)[key]);
            }
        });

        const headers = new Headers();
        if (getJwt) {
            const jwtToken = getJwt();
            if (jwtToken !== "") {
                headers.set("Authorization", `Bearer ${jwtToken}`);
                headers.set("Content-Type", "application/json");
            }
        }

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
    (urlArg: URL, getJwt?: func_GetJwt) =>
    async (args: GetNewestEventsArgs): Promise<EventDetails[] | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/getNewestEvents`;
        Object.keys(args).forEach((key) => {
            if (!!(args as any)[key]) {
                url.searchParams.set(key, (args as any)[key]);
            }
        });

        const headers = new Headers();

        if (getJwt) {
            const jwtToken = getJwt();
            if (jwtToken !== "") {
                headers.set("Authorization", `Bearer ${jwtToken}`);
                headers.set("Content-Type", "application/json");
            }
        }
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
    (urlArg: URL, getJwt?: func_GetJwt) =>
    async (args: GetFeaturedEventsArgs): Promise<EventDetails[] | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/getFeaturedEvents`;
        Object.keys(args).forEach((key) => {
            if (!!(args as any)[key]) {
                url.searchParams.set(key, (args as any)[key]);
            }
        });

        const headers = new Headers();
        if (getJwt) {
            const jwtToken = getJwt();
            if (jwtToken !== "") {
                headers.set("Authorization", `Bearer ${jwtToken}`);
                headers.set("Content-Type", "application/json");
            }
        }

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
    options?: {
        signal: AbortSignal;
    },
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
        signal: options?.signal,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        success: boolean;
        message: string;
    }>(response);
};

export const markCalendarEventAsFeatured = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
): Promise<{ success: boolean; message: string } | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/markCalendarEventAsFeatured/${eventId}`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        success: boolean;
        message: string;
    }>(response);
};

export const unmarkCalendarEventAsFeatured = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
): Promise<{ success: boolean; message: string } | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/unmarkCalendarEventAsFeatured/${eventId}`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const payload = { eventId };

    const response = await safeFetch(url, {
        method: "PUT",
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

export interface InviteAttendeesResponse {
    emails?: Record<string, string | true>;
    npubs?: Record<string, string | true>;
}

export const inviteAttendees = (urlArg: URL, getJwt: func_GetJwt) =>
async (args: {
    eventId: number;
    emails?: string[];
    npubs?: string[];
    invitationMessage?: string;
    options?: {
        signal: AbortSignal;
    };
}): Promise<InviteAttendeesResponse | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${args.eventId}/invite`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const payload = { emails: args.emails, npubs: args.npubs, invitationMessage: args.invitationMessage };
    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: args.options?.signal,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<InviteAttendeesResponse>(response);
};

export enum EventTicketStatus {
    Active = "active",
    Used = "used",
    Refunded = "refunded",
    Cancelled = "cancelled",
    Reissued = "reissued",
}

export interface UpdateEventTicketStatusPayloadType {
    status: EventTicketStatus;
}

export const updateEventTicketStatus = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    ticketId: number,
    payload: UpdateEventTicketStatusPayloadType,
): Promise<EventTicketType | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/tickets/${ticketId}/checkin`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<EventTicketType>(response);
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

export enum DescriptionOrientation {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal",
}

export interface EventTicketType {
    name: string;
    id: number;
    description: string;
    priceSats: number | null;
    priceFiat: number | null;
    maxCapacity: number | null;
    sellStartDate: string;
    sellEndDate: string;
    soldQuantity: number;
}

export interface GetEventTicketTypeResponse extends EventTicketType {
    id: number;
    soldQuantity: number;
    totalFundsCollected: number;
    requireApproval?: boolean;
}

export interface CreateTicketType {
    description: string;
    maxCapacity: null | number;
    name: string;
    priceFiat: null | number;
    priceSats: null | number;
    sellEndDate: string;
    sellStartDate: string;
}

export const createEventTicketType = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
    payload: CreateTicketType,
): Promise<EventTicketType | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${eventId}/ticket-types`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<EventTicketType>(response);
};

export const updateEventTicketType = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    ticketTypeId: number,
    payload: Partial<EventTicketType> | Omit<EventTicketType, "id" | "soldQuantity">,
): Promise<EventTicketType | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/ticket-types/${ticketTypeId}`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<EventTicketType>(response);
};

export const deleteEventTicketType = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    ticketTypeId: number,
): Promise<{} | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/ticket-types/${ticketTypeId}`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        method: "DELETE",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{}>(response);
};

export const getEventTicketTypes = (urlArg: URL) =>
async (
    eventId: number,
): Promise<GetEventTicketTypeResponse[] | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/events/${eventId}/ticket-types`;

    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<GetEventTicketTypeResponse[]>(response);
};

export interface EventTicketPurchasePayload {
    ticketTypeOrders: [
        {
            ticketTypeId: number;
            quantity: number;
        },
    ];
    rsvpData: {
        lightningAddress?: string;
        status: string;
        calendarEventId: number;
        registrationAnswers: any;
        event?: NostrEvent<NostrKind, Tag>;
    };
    email: string;
    name: string;
}

export interface EventTicketPurchaseResponse {
    paymentId: number;
    orderId: number;
    paymentHash: string;
    paymentRequest: string;
    amount: number;
    currency: string;
    status: string;
    expiresAt: Date;
    paidAt: Date | null;
    expiredAt: Date | null;
    failedAt: Date | null;
}

export type GetEventTicketStatusResponse = EventTicketPurchaseResponse;
export const purchaseEventTicket =
    (urlArg: URL, getJwt: func_GetJwt, getNostrSigner: func_GetNostrSigner) =>
    async (
        eventId: number,
        payload: EventTicketPurchasePayload,
        calendarEvent: {
            accountId: number;
            calendarEventId: number;
            dtag: string;
            pubkey: string;
        },
    ): Promise<EventTicketPurchaseResponse | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/events/${eventId}/order`;

        let isNostrAccount = null;

        let signer = null;

        signer = await getNostrSigner();
        if (signer instanceof Error) {
            isNostrAccount = false;
            signer = null;
        } else {
            isNostrAccount = true;
        }

        const uuid = generateUUID();
        const dTag = calendarEvent.dtag;
        const aTag = `${NostrKind.Calendar_Time}:${calendarEvent.pubkey}:${dTag}`;
        let event = null;

        if (signer && isNostrAccount) {
            event = await prepareNostrEvent(signer, {
                kind: 31925 as NostrKind,
                content: "",
                tags: [
                    ["a", aTag],
                    ["d", uuid],
                    ["status", payload.rsvpData.status],
                ],
            });
        }

        if (event instanceof Error) {
            return event;
        }

        const jwtToken = getJwt();
        const headers = new Headers();
        headers.set("Content-Type", "application/json");

        if (jwtToken) {
            headers.set("Authorization", `Bearer ${jwtToken}`);
        }

        let eventRSVPData;
        if (event && isNostrAccount) {
            eventRSVPData = { ...payload.rsvpData, event };
            payload.rsvpData = eventRSVPData;
        }

        const response = await safeFetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<EventTicketPurchaseResponse>(response);
    };

export const getEventTicketPaymentStatus = (urlArg: URL) =>
async (
    paymentId: number,
): Promise<GetEventTicketStatusResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/payments/${paymentId}/status`;

    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<GetEventTicketStatusResponse>(response);
};

export const assignTicketToRSVP = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    ticketTypeId: number,
    rsvpId: number,
): Promise<{ success: boolean; message: string } | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/rsvps/${rsvpId}`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    if (jwtToken !== "") {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }
    let payload = {
        ticketTypeId,
    };

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });

    if (response instanceof Error) {
        return response;
    }

    return handleResponse<{ success: boolean; message: string } | Error>(response);
};

export const removeTicketFromUser = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    rsvpId: number,
): Promise<{ success: boolean; message: string } | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/tickets/${rsvpId}`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    if (jwtToken !== "") {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        method: "DELETE",
        headers,
    });

    if (response instanceof Error) {
        return response;
    }

    return handleResponse<{ success: boolean; message: string } | Error>(response);
};

export interface EventFinancialsSummaryResponse {
    totalEarnings: number; // Total from all paid orders (satoshis)
    availableBalance: number; // Available to withdraw = earnings - withdrawn - pending withdrawals - refunded
    pendingBalance: number; // Orders awaiting payment
    pendingWithdrawals: number; // Withdrawals being processed
    totalWithdrawn: number; // Total withdrawn to date
    totalRefunded: number; // Total refunded to customers
    currency: string; // "BTC" or "USD"(in future)
    totalTicketsSold: number; // Number of tickets sold
}

export const getEventFinancialsSummary = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
): Promise<EventFinancialsSummaryResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${eventId}/financials/summary`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<EventFinancialsSummaryResponse>(response);
};

/**
 * Withdrawal status enum with
 */
export enum WithdrawalStatus {
    /** Withdrawal created, payment not initiated */
    Pending = "pending",
    /** Lightning payment in progress (IN_FLIGHT) */
    Processing = "processing",
    /** Payment successful, funds transferred */
    Completed = "completed",
    /** Payment failed, funds remain in wallet */
    Failed = "failed",
    /** Withdrawal cancelled */
    Cancelled = "cancelled",
}

export interface EventFinancialsWithdrawalResponse {
    id: number;
    calendarEventId: number;
    accountId: number;
    amount: number;
    currency: string;
    fee: number;
    netAmount: number;
    status: WithdrawalStatus;
    withdrawalMethod: string;
    destinationAddress: string;
    requestedAt: string;
    processingStartedAt: string;
    completedAt: string | null;
    failedAt: string | null;
    failureReason: string | null;
}

export interface EventTicketWithdrawalFeeResponse {
    fee: number;
    maxWithdrawableAmount: number;
}

export const getEventFinancialsWithdrawalStatus = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    withdrawalId: number,
): Promise<EventFinancialsWithdrawalResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/financials/withdrawals/${withdrawalId}`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<EventFinancialsWithdrawalResponse>(response);
};

export interface EventFinancialsWithdrawalFeeEstimationsResponse {
    fee: number;
    maxWithdrawableAmount: number;
}

export const getEventFinancialsWithdrawalFeeEstimations = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
    lightningAddress: string,
    amount: number,
): Promise<EventFinancialsWithdrawalFeeEstimationsResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${eventId}/withdrawals/fee-estimations`;
    url.searchParams.set("lightning_address", lightningAddress);
    url.searchParams.set("amount", amount.toString());

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<EventFinancialsWithdrawalFeeEstimationsResponse>(response);
};

export const getEventTicketWithdrawalFee = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    params: { eventId: number; lightningAddress: string; amount: number },
): Promise<EventTicketWithdrawalFeeResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${params.eventId}/withdrawals/fee-estimations`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const queryString = `lightning_address=${params.lightningAddress}&amount=${params.amount}`;
    const finalUrl = `${url.origin}${url.pathname}?${queryString}`;

    const response = await safeFetch(finalUrl, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<EventTicketWithdrawalFeeResponse>(response);
};

export const postEventFinancialsWithdraw = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    params: {
        eventId: number;
        amount: number;
        lightningAddress: string;
    },
): Promise<EventFinancialsWithdrawalResponse | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${params.eventId}/financials/withdraw`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    if (jwtToken !== "") {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const { eventId, ...payload } = params;

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });

    if (response instanceof Error) {
        return response;
    }

    return handleResponse<EventFinancialsWithdrawalResponse>(response);
};

export interface UserEventsContactsResponse {
    contacts: AccountDTO[];
    accepted?: AccountDTO[];
    declined?: AccountDTO[];
    tentative?: AccountDTO[];
    waitlisted?: AccountDTO[];
    requested?: AccountDTO[];
    rejected?: AccountDTO[];
    invited?: AccountDTO[];
}

/**
 * GET /secure/user/events/images
 * Returns URLs of images from previous events for which the authenticated user
 * is an organizer (owner or cohost). Ordered from most recent to oldest,
 * deduplicated, and limited to 20 by default.
 *
 * @param offset Optional offset for pagination.
 * @param limit  Optional limit (defaults to 20).
 * @returns Promise<string[] | Error> Array of image URLs.
 */
export const getUserEventsImages =
    (urlArg: URL, getJwt: () => string) => async (args?: { offset?: number; limit?: number }) => {
        const url = copyURL(urlArg);
        url.pathname = `/secure/user/events/images`;
        if (args?.offset !== undefined) {
            url.searchParams.set("offset", args.offset.toString());
        }
        if (args?.limit !== undefined) {
            url.searchParams.set("limit", args.limit.toString());
        }

        const jwtToken = getJwt();
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        headers.set("Content-Type", "application/json");

        const response = await safeFetch(url, { headers });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<string[]>(response);
    };

/**
 * GET /secure/user/events/contacts
 * Returns the list of attendees (RSVP accepted) of past events for which the
 * authenticated user was the owner or a cohost.
 *
 * Optional query params (all are part of the `args` object):
 * @param fromEventId Filter: only include attendees who attended this source event.
 * @param forEventId  Partition: move any attendees who already RSVPed to this target event
 *                    into `accepted` or `declined`; if omitted, everyone stays under `contacts`.
 *
 * @returns Promise<UserEventsContactsResponse | Error>
 */
export const getEventsContacts =
    (urlArg: URL, getJwt: () => string) => async (args: { fromEventId?: number; forEventId?: number }) => {
        const url = copyURL(urlArg);
        url.pathname = `/secure/user/events/contacts`;
        if (args.fromEventId !== undefined) {
            url.searchParams.set("fromEventId", args.fromEventId.toString());
        }
        if (args.forEventId !== undefined) {
            url.searchParams.set("forEventId", args.forEventId.toString());
        }

        const jwtToken = getJwt();
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        headers.set("Content-Type", "application/json");

        const response = await safeFetch(url, { headers });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<UserEventsContactsResponse>(response);
    };

export type GetEventUserFinancialTimelineArgs = {
    eventId: number;
    accountId: number;
};

export const getEventUserFinancialTimeline = (urlArg: URL, getJwt: func_GetJwt) => {
    return async (args: GetEventUserFinancialTimelineArgs) => {
        const url = copyURL(urlArg);
        url.pathname = `/secure/events/${args.eventId}/accounts/${args.accountId}/timeline`;

        const jwtToken = getJwt();
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        headers.set("Content-Type", "application/json");

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) {
            return response;
        }

        return handleResponse<EventUserTimeline>(response);
    };
};

export const getCalendarEventTags = (urlArg: URL) =>
async (
    search: string,
) => {
    const url = copyURL(urlArg);
    url.pathname = `/events/tags`;

    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    url.searchParams.set("search", search);

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CalendarEventTag[]>(response);
};

/**
 * This endpoint uses AI inference which typically takes 3-5 seconds to return results.
 * Please implement a loading state and consider adding a timeout mechanism (e.g., 10 seconds). Avoid calling this endpoint frequently.
 * The endpoint calls Gemini to obtain recommendation results.
 */
export const getRecommendedCalendarEventTags = (urlArg: URL) =>
async (
    eventInfo: string,
) => {
    const url = copyURL(urlArg);
    url.pathname = `/events/tags/recommended`;

    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    url.searchParams.set("eventInfo", eventInfo);

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CalendarEventTag[]>(response);
};

export const createCalendarEventTag = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    tagName: string,
) => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/tags`;

    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    if (jwtToken !== "") {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const payload = { name: tagName };

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CalendarEventTag>(response);
};
