import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { func_GetJwt } from "../../sdk.ts";
import type { Notification } from "../../models/notification.ts";

export type NotificationResponse = {
    notifications: Notification[];
    total: number;
    unread: number;
};

export const getNotifications =
    (urlArg: URL, getJwt: func_GetJwt) => async (args: { page: number; limit: number }) => {
        const url = copyURL(urlArg);
        url.pathname = `/secure/getNotifications`;
        url.searchParams.set("page", String(args.page));
        url.searchParams.set("limit", String(args.limit));

        const jwtToken = getJwt();
        if (jwtToken == "") {
            return new Error("jwt token is empty");
        }
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, { headers });
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<NotificationResponse>(response);
    };
