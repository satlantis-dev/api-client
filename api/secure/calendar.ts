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
    type CalendarEventSubmission,
    type func_GetJwt,
    type func_GetNostrSigner,
    type PlaceCalendarEvent,
    type SearchAccountDTO,
} from "../../sdk.ts";
import type { AnswerType, EventDetails } from "../events.ts";
import type { AccountDTO } from "../../models/account.ts";
import type { CalendarEventTag } from "../../models/event.ts";

// https://github.com/satlantis-dev/api/blob/dev/shared/models.go#L17
export interface PlaceCalendarEventPost {
    event: NostrEvent;
    placeId?: number;
    contactEmail?: string;
    isUnlisted?: boolean;
    isHidingAttendees?: boolean;
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
    contactEmail?: string;
    isHidingAttendees?: boolean
    isUnlisted?: boolean;
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

export const relistCalendarEvent =
    (urlArg: URL, getJwt: () => string) => async (args: { eventId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events/${args.eventId}/relist`;

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

export const unlistCalendarEvent =
    (urlArg: URL, getJwt: () => string) => async (args: { eventId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events/${args.eventId}/unlist`;

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

export const unhideAttendeesCalendarEvent =
    (urlArg: URL, getJwt: () => string) => async (args: { eventId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events/${args.eventId}/unhide-attendees`;

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

export const hideAttendeesCalendarEvent =
    (urlArg: URL, getJwt: () => string) => async (args: { eventId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events/${args.eventId}/hide-attendees`;

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

export const unhideLocationCalendarEvent =
    (urlArg: URL, getJwt: () => string) => async (args: { eventId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events/${args.eventId}/unhide-location`;

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

export const hideLocationCalendarEvent =
    (urlArg: URL, getJwt: () => string) => async (args: { eventId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events/${args.eventId}/hide-location`;

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

export const postCalendarEventAnnouncementV2 = (urlArg: URL, getJwt: () => string) =>
async (args: {
    calendarEventId: number;
    event: NostrEvent;
    toDiscussion: boolean;
    toEmail: boolean;
    toNostr: boolean;
    toNotification: boolean;
    emailSubject: string;
    emailRecipientIds: number[];
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${args.calendarEventId}/announcements`;
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

export const sendAnnouncementPreview = (urlArg: URL, getJwt: () => string) =>
async (args: {
    calendarEventId: number;
    announcementId: number;
    email: string;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${args.calendarEventId}/announcements/${args.announcementId}/preview`;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    const body = JSON.stringify({ email: args.email });
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

export const deleteAnnouncement = (urlArg: URL, getJwt: () => string) =>
async (args: {
    calendarEventId: number;
    announcementId: number;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${args.calendarEventId}/announcements/${args.announcementId}`;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    const response = await safeFetch(url, {
        method: "DELETE",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CalendarEventNote>(response);
};

export const putAnnouncementContent = (urlArg: URL, getJwt: () => string) =>
async (args: {
    calendarEventId: number;
    announcementId: number;
    event: NostrEvent;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${args.calendarEventId}/announcements/${args.announcementId}`;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    const body = JSON.stringify(args.event);
    const response = await safeFetch(url, {
        method: "PUT",
        body,
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CalendarEventNote>(response);
};

export const republishAnnouncement = (urlArg: URL, getJwt: () => string) =>
async (args: {
    calendarEventId: number;
    announcementId: number;
    body: {
        toDiscussion: boolean;
        toEmail: boolean;
        toNostr: boolean;
        toNotification: boolean;
        emailSubject: string;
        emailRecipientIds: number[];
    };
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${args.calendarEventId}/announcements/${args.announcementId}/republish`;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    const body = JSON.stringify(args.body);
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

export type EventRegistrationAnswer = {
    label: string;
    answerType: AnswerType;
    answer?: string | boolean;
};

export type PostCalendarEventRSVPArgs = {
    response: "accepted" | "maybe" | "declined" | "tentative" | "waitlisted" | "requested";
    calendarEvent: {
        accountId: number;
        calendarEventId: number;
        dtag: string;
        pubkey: string;
    };
    registrationAnswers?: EventRegistrationAnswer[];
};

export const postCalendarEventRSVP =
    (urlArg: URL, getJwt: func_GetJwt, getSigner: func_GetNostrSigner) =>
    async (args: PostCalendarEventRSVPArgs) => {
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
                ["status", args.response],
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
                ...(args.registrationAnswers && Object.keys(args.registrationAnswers).length > 0 && {
                    registrationAnswers: {
                        answers: args.registrationAnswers,
                    },
                }),
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
    placeId?: number;
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
    placeId?: number;
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
        url.pathname = `/secure/events/${args.eventId}/official-calendar`;
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
 * This function allows an event owner to submit any event to another user's calendar.
 * The submission requires approval from the calendar owner before the event is officially added.
 *
 * Backend validation:
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
        url.pathname = `/secure/calendar/${args.calendarId}/event/${args.eventId}/submit`;

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
        url.pathname = `/secure/calendar/${args.calendarId}/event/${args.eventId}/approve`;

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
        url.pathname = `/secure/calendar/${args.calendarId}/event/${args.eventId}/decline`;

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

export const getEventSubmissions =
    (urlArg: URL, getJwt: () => string) =>
    async (args: { calendarId: number }): Promise<CalendarEventSubmission[] | Error> => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/calendar/${args.calendarId}/submissions`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<CalendarEventSubmission[]>(response);
    };

export const importEventFromUrl =
    (urlArg: URL, getJwt: () => string) =>
    async (args: { eventUrl: string }): Promise<CalendarEvent | Error> => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events/import-event-from-url`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        headers.set("Content-Type", "application/json");
        const body = JSON.stringify({ url: args.eventUrl });
        const response = await safeFetch(url, {
            method: "POST",
            body,
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<CalendarEvent>(response);
    };

export const subscribeToCalendar =
    (urlArg: URL, getJwt: () => string) => async (args: { calendarId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/user/calendar/${args.calendarId}/subscribe`;
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

export const unsubscribeFromCalendar =
    (urlArg: URL, getJwt: () => string) => async (args: { calendarId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/user/calendar/${args.calendarId}/unsubscribe`;
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

export const getUserCalendarSubscriptions =
    (urlArg: URL, getJwt: () => string) => async (): Promise<Calendar[] | Error> => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/user/calendar-subscriptions`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<Calendar[]>(response);
    };

export const isSubscribedToCalendar =
    (urlArg: URL, getJwt: () => string) => async (args: { calendarId: number }) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/user/calendar/${args.calendarId}/is-subscribed`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<{
            isSubscribed: boolean;
        }>(response);
    };

export const getCalendarSubscribers =
    (urlArg: URL, getJwt: () => string) =>
    async (args: { calendarId: number }): Promise<AccountDTO[] | Error> => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/user/calendar/${args.calendarId}/subscribers`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<AccountDTO[]>(response);
    };

export function markCalendarAsFeatured(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: {
        calendarId: number;
    }) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = copyURL(urlArg);
        url.pathname = `/secure/calendar/${args.calendarId}/mark-featured`;

        const response = await safeFetch(url, {
            method: "PUT",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse(response);
    };
}

export function unmarkCalendarAsFeatured(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: {
        calendarId: number;
    }) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = copyURL(urlArg);
        url.pathname = `/secure/calendar/${args.calendarId}/unmark-featured`;

        const response = await safeFetch(url, {
            method: "PUT",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse(response);
    };
}

export function getFeaturedCalendars(urlArg: URL) {
    return async (args: {
        placeId?: number;
    }) => {
        const url = copyURL(urlArg);
        url.pathname = `/calendars/featured`;
        if (args.placeId) {
            url.searchParams.set("placeId", args.placeId.toString());
        }

        const response = await safeFetch(url);

        if (response instanceof Error) return response;
        return handleResponse<Calendar[]>(response);
    };
}

export function getRecommendedCalendars(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: {
        placeId?: number;
    }) => {
        const jwtToken = getJwt();
        if (!jwtToken) return new Error("JWT token is empty.");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const url = copyURL(urlArg);
        url.pathname = `/secure/calendars/recommended`;
        if (args.placeId) {
            url.searchParams.set("placeId", args.placeId.toString());
        }

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<Calendar[]>(response);
    };
}

export function getPopularCalendars(urlArg: URL) {
    return async (args: {
        placeId?: number;
    }) => {
        const url = copyURL(urlArg);
        url.pathname = `/calendars/popular`;
        if (args.placeId) {
            url.searchParams.set("placeId", args.placeId.toString());
        }

        const response = await safeFetch(url);

        if (response instanceof Error) return response;
        return handleResponse<Calendar[]>(response);
    };
}

export function getNewestCalendars(urlArg: URL) {
    return async (args: {
        placeId?: number;
    }) => {
        const url = copyURL(urlArg);
        url.pathname = `/calendars/newest`;
        if (args.placeId) {
            url.searchParams.set("placeId", args.placeId.toString());
        }

        const response = await safeFetch(url);

        if (response instanceof Error) return response;
        return handleResponse<Calendar[]>(response);
    };
}

export function searchCalendars(urlArg: URL) {
    return async (args: {
        search: string;
        placeId?: number;
        page?: number;
        limit?: number;
    }, options?: {
        signal: AbortSignal;
    }) => {
        const url = copyURL(urlArg);
        url.pathname = `/calendars`;
        url.searchParams.set("search", args.search);
        if (args.placeId) {
            url.searchParams.set("placeId", args.placeId.toString());
        }
        if (args.page) {
            url.searchParams.set("page", args.page.toString());
        }
        if (args.limit) {
            url.searchParams.set("limit", args.limit.toString());
        }

        const response = await safeFetch(url, {
            signal: options?.signal,
        });

        if (response instanceof Error) return response;
        return handleResponse<Calendar[]>(response);
    };
}

export function getCalendarsRandomized(urlArg: URL) {
    return async (args: {
        placeId?: number;
        page?: number;
        limit?: number;
        search?: string;
        calendarEventTags?: CalendarEventTag[];
    }) => {
        const url = copyURL(urlArg);
        url.pathname = `/calendars/randomized`;
        if (args.placeId) {
            url.searchParams.set("placeId", args.placeId.toString());
        }
        if (args.page) {
            url.searchParams.set("page", args.page.toString());
        }
        if (args.limit) {
            url.searchParams.set("limit", args.limit.toString());
        }
        if (args.search) {
            url.searchParams.set("search", args.search);
        }
        if (args.calendarEventTags && args.calendarEventTags.length > 0) {
            // https://github.com/satlantis-dev/api/blob/dev/rest/calendar.go#L1141
            url.searchParams.set("calendarEventTags", args.calendarEventTags.map((tag) => tag.id).join(","));
        }

        const response = await safeFetch(url);

        if (response instanceof Error) return response;
        return handleResponse<Calendar[]>(response);
    };
}

export function getEventsFromCalendar(urlArg: URL) {
    return async (args: {
        calendarId: number;
        period?: "upcoming" | "past";
        start_date?: string; // 'YYYY-MM-DD' format (overrides period)
        end_date?: string; // 'YYYY-MM-DD' format (overrides period)
    }) => {
        const url = copyURL(urlArg);
        url.pathname = `/calendar/${args.calendarId}/events`;

        if (args.start_date) {
            url.searchParams.set("start_date", args.start_date);
        }
        if (args.end_date) {
            url.searchParams.set("end_date", args.end_date);
        }
        if (args.period) {
            url.searchParams.set("period", args.period);
        }

        const response = await safeFetch(url);

        if (response instanceof Error) return response;
        return handleResponse<CalendarEvent[]>(response);
    };
}
