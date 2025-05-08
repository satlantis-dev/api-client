import { type NostrEvent, NostrKind, prepareNostrEvent } from "@blowater/nostr-sdk";
import { copyURL, generateUUID, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import {
    type Account,
    type CalendarEvent,
    type CalendarEventNote,
    type func_GetJwt,
    type func_GetNostrSigner,
    type PlaceCalendarEvent,
} from "../../sdk.ts";

export interface PlaceCalendarEventPost {
    event: NostrEvent;
    placeId: number;
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

export const postPlaceCalendarEvent =
    (urlArg: URL, getJwt: () => string) => async (args: PlaceCalendarEventPost) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/createPlaceCalendarEvent`;

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
        url.pathname = `/secure/updateCalendarEvent`;

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

export const postCalendarEventRSVP =
    (urlArg: URL, getJwt: func_GetJwt, getSigner: func_GetNostrSigner) =>
    async (args: {
        response: "accepted" | "maybe" | "declined" | "tentative";
        calendarEvent: {
            accountId: number;
            calendarEventId: number;
            dtag: string;
            pubkey: string;
        };
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
            }),
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<Account>(response);
    };
