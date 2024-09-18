import { NostrKind, prepareNostrEvent } from "@blowater/nostr-sdk";
import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import { type Account, type func_GetJwt, type func_GetNostrSigner, Hashtag } from "../../sdk.ts";
import type { CalendarEvent } from "../../models/calendar.ts";

export const postCalendarEventRSVP =
    (urlArg: URL, getJwt: func_GetJwt, getSigner: func_GetNostrSigner) =>
    async (calendarEvent: CalendarEvent) => {
        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }

        const signer = await getSigner();
        if (signer instanceof Error) {
            return signer;
        }

        const uuid = crypto.randomUUID();
        const dTag = calendarEvent.dTag;
        const aTag = `${NostrKind.Calendar_Time}:${calendarEvent.note.event.pubkey}:${dTag}`;

        const event = await prepareNostrEvent(signer, {
            kind: 91925 as NostrKind,
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
                accountId: calendarEvent.accountId,
                event,
                noteId: calendarEvent.noteId,
                status: "accepted",
            }),
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<Account>(response);
    };
