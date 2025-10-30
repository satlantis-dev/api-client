import { type NostrEvent, NostrKind, prepareNostrEvent } from "@blowater/nostr-sdk";
import {
    copyURL,
    generateUUID,
    handleResponse,
    handleSafeResponse,
    handleStringResponse,
} from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import {
    type Account,
    type Calendar,
    type CalendarEvent,
    type CalendarEventNote,
    type func_GetJwt,
    type func_GetNostrSigner,
    type PlaceCalendarEvent,
    type SearchAccountDTO,
} from "../../sdk.ts";
import type { AnswerType } from "../events.ts";

export interface PlaceCalendarEventPost {
    event: NostrEvent;
    placeId?: number;
}

interface EmailEventCohost {
    email: string;
    displayName: string;
    picture: string;
}

export interface PlaceCalendarEventInviteCohostViaEmail {
    calendarEventId: number;
    cohosts: EmailEventCohost[];
}

export interface PlaceCalendarEventPut {
    event: NostrEvent;
    calendarEventId: number;
}

export interface RespondCalendarEventCohostInvitationPut {
    calendarEventId: number;
    action: "accept" | "decline";
}

export interface PlaceCalendarEventDelete {
    event: NostrEvent;
    placeCalendarEventId: number;
}

export interface CalendarEventNotePost {
    event: NostrEvent;
    calendarEventId: number;
}

export const getEventById = (urlArg: URL) => async (args: { id: number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getCalendarEventByID/${args.id}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CalendarEvent>(response);
};

export const searchAccountViaEmail =
    (urlArg: URL, getJwt: () => string) =>
    async (args: { email: string }): Promise<SearchAccountDTO | Error> => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events/cohosts`;
        url.searchParams.set("search", args.email);

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<SearchAccountDTO>(response);
    };

export const sendCohostEmailInviteToCalendarEvent =
    (urlArg: URL, getJwt: () => string) => async (args: PlaceCalendarEventInviteCohostViaEmail) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events/${args.calendarEventId}/cohosts`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const body = JSON.stringify(args.cohosts);

        const response = await safeFetch(url, {
            method: "POST",
            body,
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<PlaceCalendarEvent>(response);
    };

export const postPlaceCalendarEvent =
    (urlArg: URL, getJwt: () => string) => async (args: PlaceCalendarEventPost) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const body = JSON.stringify(args);

        const response = await safeFetch(url, {
            method: "POST",
            body,
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<PlaceCalendarEvent>(response);
    };

export const putUpdateCalendarEvent =
    (urlArg: URL, getJwt: () => string) => async (args: PlaceCalendarEventPut) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const body = JSON.stringify(args);

        const response = await safeFetch(url, {
            method: "PUT",
            body,
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<PlaceCalendarEvent>(response);
    };

export const respondCalendarEventCohostInvitation =
    (urlArg: URL, getJwt: () => string) => async (args: RespondCalendarEventCohostInvitationPut) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/respondCalendarEventCohostInvitation/${args.calendarEventId}`;
        url.searchParams.append("action", args.action);

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const body = JSON.stringify({ action: args.action });

        const response = await safeFetch(url, {
            method: "PUT",
            body,
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<PlaceCalendarEvent>(response);
    };

export const postCalendarEventAnnouncement =
    (urlArg: URL, getJwt: () => string) => async (args: CalendarEventNotePost) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/createCalendarEventAnnouncement`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const body = JSON.stringify(args);

        const response = await safeFetch(url, {
            method: "POST",
            body,
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<CalendarEventNote>(response);
    };

export const postCalendarEventNote =
    (urlArg: URL, getJwt: () => string) => async (args: CalendarEventNotePost) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/createCalendarEventNote`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const body = JSON.stringify(args);

        const response = await safeFetch(url, {
            method: "POST",
            body,
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<CalendarEventNote>(response);
    };

export const deletePlaceCalendarEvent =
    (urlArg: URL, getJwt: () => string) => async (args: PlaceCalendarEventDelete) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/deletePlaceCalendarEvent/${args.placeCalendarEventId}`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const body = JSON.stringify(args.event);

        const response = await safeFetch(url, {
            method: "DELETE",
            body,
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<PlaceCalendarEvent>(response);
    };

export const deletePlaceCalendarEventById =
    (urlArg: URL, getJwt: () => string) => async (args: PlaceCalendarEventDelete) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events/${args.placeCalendarEventId}`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const body = JSON.stringify(args.event);

        const response = await safeFetch(url, {
            method: "DELETE",
            body,
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<PlaceCalendarEvent>(response);
    };

export const postCalendarEventRSVP =
    (urlArg: URL, getJwt: func_GetJwt, getSigner: func_GetNostrSigner) =>
    async (args: {
        response: "accepted" | "maybe" | "declined" | "tentative" | "waitlisted" | "requested";
        calendarEvent: {
            accountId: number;
            calendarEventId: number;
            dtag: string;
            pubkey: string;
        };
        registrationAnswers?: {
            label: string;
            answerType: AnswerType;
            answer?: string | boolean;
        }[];
    }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const signer = await getSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const uuid = generateUUID();
        const dTag = args.calendarEvent.dtag;
        const aTag = `${NostrKind.Calendar_Time}:${args.calendarEvent.pubkey}:${dTag}`;

        const event = await prepareNostrEvent(signer, {
            kind: 31925 as NostrKind,
            content: "",
            tags: [
                ["a", aTag],
                ["d", uuid],
                ["status", "accepted"],
            ],
        });
        if (event instanceof Error) {
            return event;
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/postCalendarEventRSVP`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "POST",
            body: JSON.stringify({
                accountId: args.calendarEvent.accountId,
                calendarEventId: args.calendarEvent.calendarEventId,
                event,
                status: args.response,
                registrationAnswers: {
                    answers: args.registrationAnswers,
                },
            }),
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<Account>(response);
    };

export const downloadCalendarEventAttendees =
    (urlArg: URL, getJwt: () => string) => async (args: { placeCalendarEventId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/downloadCalendarEventAttendees/${args.placeCalendarEventId}`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleStringResponse(response);
    };

export const downloadCalendarEventIcsFile =
    (urlArg: URL, getJwt: () => string) => async (args: { calendarEventId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/downloadCalendarEventIcsFile/${args.calendarEventId}`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleStringResponse(response);
    };

export type GetCalendarByIdArgs = {
    id: number;
};

export const getCalendarByID = (urlArg: URL) => async (args: GetCalendarByIdArgs) => {
    const url = copyURL(urlArg);
    url.pathname = `/calendar/${args.id}`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Calendar>(response);
};

export type GetCalendarsByAccountArgs = {
    npub: string;
};

export const getCalendarsByAccount = (urlArg: URL) => async (args: GetCalendarsByAccountArgs) => {
    const url = copyURL(urlArg);
    url.pathname = `/account/${args.npub}/calendars`;

    const response = await safeFetch(url);

    if (response instanceof Error) {
        return response;
    }

    return handleResponse<Calendar[]>(response);
};

export type CreateCalendarRequest = {
    name: string;
    isPublic: boolean;
    description?: string;
    slug?: string;
    banner?: string;
};

export const createCalendar = (urlArg: URL, getJwt: () => string) => async (args: CreateCalendarRequest) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/calendars`;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");
    const body = JSON.stringify(args);
    const response = await safeFetch(url, {
        method: "POST",
        body,
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Calendar>(response);
};

export type EditCalendarRequest = {
    name: string;
    isPublic: boolean;
    description?: string;
    slug?: string;
    banner?: string;
};

export type EditCalendarArgs = {
    id: number;
    calendar: EditCalendarRequest;
};

export const editCalendar = (urlArg: URL, getJwt: () => string) => async (args: EditCalendarArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/calendar/${args.id}`;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");
    const body = JSON.stringify(args.calendar);
    const response = await safeFetch(url, {
        method: "PUT",
        body,
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Calendar>(response);
};

export type DeleteCalendarArgs = {
    id: number;
};

export const deleteCalendar = (urlArg: URL, getJwt: () => string) => async (args: DeleteCalendarArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }

    const url = copyURL(urlArg);
    url.pathname = `/secure/calendar/${args.id}`;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    const response = await safeFetch(url, {
        method: "DELETE",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleSafeResponse<string>(response);
};

export type AddEventToCalendarArgs = {
    calendarId: number;
    eventId: number;
};

export const addEventToCalendar =
    (urlArg: URL, getJwt: () => string) => async (args: AddEventToCalendarArgs) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/calendar/${args.calendarId}/event/${args.eventId}`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        const response = await safeFetch(url, {
            method: "POST",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleStringResponse(response);
    };

export type RemoveEventFromCalendarArgs = {
    calendarId: number;
    eventId: number;
};

export const removeEventFromCalendar =
    (urlArg: URL, getJwt: () => string) => async (args: RemoveEventFromCalendarArgs) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/calendar/${args.calendarId}/event/${args.eventId}`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleStringResponse(response);
    };

export type SetOfficialCalendarToEventArgs = {
    calendarId: number;
    eventId: number;
};

/**
 * Prerequisites for Official Calendar:
 * 1. Events must have already been added to the target calendar (verified by CalendarHasEvent).
 * 2. An event that is not listed on the calendar cannot be set as the official event for that calendar.
 */
export const setOfficialCalendarToEvent =
    (urlArg: URL, getJwt: () => string) => async (args: SetOfficialCalendarToEventArgs) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events/${args.eventId}/official-calendar/${args.calendarId}`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        const response = await safeFetch(url, {
            method: "PUT",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleStringResponse(response);
    };

export type UnsetOfficialCalendarFromEventArgs = {
    eventId: number;
};

export const unsetOfficialCalendarFromEvent =
    (urlArg: URL, getJwt: () => string) => async (args: UnsetOfficialCalendarFromEventArgs) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events/${args.eventId}`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleStringResponse(response);
    };

/**
 * Submit an event to a calendar for review
 *
 * This function allows an event owner to submit their event to another user's calendar.
 * The submission requires approval from the calendar owner before the event is officially added.
 *
 * Backend validation:
 * - Event must exist and belong to the authenticated user
 * - Event cannot already be assigned to the target calendar
 * - Cannot submit to your own calendar
 * - Creates a notification of type CalendarEventSubmission for the calendar owner
 */
export const submitEventToCalendar =
    (urlArg: URL, getJwt: () => string) => async (args: { calendarId: number; eventId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/calendars/${args.calendarId}/event/${args.eventId}/submit`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        const response = await safeFetch(url, {
            method: "POST",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleStringResponse(response);
    };

/**
 * Approve an event submission to a calendar
 *
 * This function allows a calendar owner to approve a submitted event, officially adding it to their calendar.
 * Only the calendar owner can approve submissions for their calendar.
 *
 * Backend operations:
 * - Confirms submission notification exists with matching payload
 * - Adds event to the calendar via AddEventToCalendar
 * - Sets official calendar for the event via SetOfficialCalendarForEvent
 * - Creates a notification of type CalendarEventSubmissionAccepted for the event owner
 * - Notification includes calendar banner if available
 */
export const approveEventSubmission =
    (urlArg: URL, getJwt: () => string) => async (args: { calendarId: number; eventId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/calendars/${args.calendarId}/event/${args.eventId}/approve`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        const response = await safeFetch(url, {
            method: "POST",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleStringResponse(response);
    };

/**
 * Decline an event submission to a calendar
 *
 * This function allows a calendar owner to decline a submitted event, rejecting the request to add it to their calendar.
 * Only the calendar owner can decline submissions for their calendar.
 *
 * Backend operations:
 * - Confirms submission notification exists with matching payload
 * - Creates a notification of type CalendarEventSubmissionDeclined for the event owner
 * - Notification includes event banner if available
 * - No changes are made to the calendar or event relationships
 */
export const declineEventSubmission =
    (urlArg: URL, getJwt: () => string) => async (args: { calendarId: number; eventId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/calendars/${args.calendarId}/event/${args.eventId}/reject`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        const response = await safeFetch(url, {
            method: "POST",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleStringResponse(response);
    };
