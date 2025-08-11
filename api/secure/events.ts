import type { Country } from "$lib/types/models/country.ts";
import type { func_GetJwt } from "../../sdk.ts";
import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { AccountDTO } from "../../models/account.ts";
import type {
    CalendarEventAnnouncement,
    CalendarEventNote,
    CalendarEventRSVP,
    CalendarEventType,
    Cohost,
    EventInterest,
} from "../../models/calendar.ts";
import type { LocationDTO } from "../../models/location.ts";
import type { BoundingBox } from "../../models/place.ts";

export interface CalendarEventDetailResponse {
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
    event: {
        id: number;
        nostrId: string;
        createdAt: number;
        content: string;
        kind: number;
        pubkey: string;
        sig: string;
        tags: string | null;
        tagsData: any | null;
        reconciled: boolean;
    };
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
    country: Country;
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
    (urlArg: URL, getJwt: () => string) =>
    async (args: { eventId: string }): Promise<CalendarEventDetailResponse | Error> => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const url = copyURL(urlArg);
        url.pathname = `/secure/events/${args.eventId}`;

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<CalendarEventDetailResponse>(response);
    };
