import { NostrKind, prepareNostrEvent } from "@blowater/nostr-sdk";
import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import { type Account, type func_GetJwt, type func_GetNostrSigner } from "../../sdk.ts";

export const postCalendarEventRSVP =
    (urlArg: URL, getJwt: func_GetJwt, getSigner: func_GetNostrSigner) =>
    async (args: {
        response: "accepted" | "maybe" | "declined" | "tentative";
        calendarEvent: {
            dTag: string;
            note: {
                event: {
                    pubkey: string;
                };
            };
            accountId: number;
            noteId: number;
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

        const uuid = crypto.randomUUID();
        const dTag = args.calendarEvent.dTag;
        const aTag = `${NostrKind.Calendar_Time}:${args.calendarEvent.note.event.pubkey}:${dTag}`;

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
                accountId: args.calendarEvent.accountId,
                event,
                noteId: args.calendarEvent.noteId,
                status: args.response,
            }),
            headers,
        });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<Account>(response);
    };
