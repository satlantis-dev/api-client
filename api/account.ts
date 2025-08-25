import { ApiError, copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Account, AccountDTO } from "../models/account.ts";
import { type CalendarEvent, CalendarEventPeriod, type func_GetJwt, type SearchAccountDTO } from "../sdk.ts";

export const getAccount =
    (urlArg: URL, getJwt: func_GetJwt) => async (args: { npub?: string; username?: string }) => {
        if (args.npub) {
            const url = copyURL(urlArg);
            url.pathname = `/getAccount/${args.npub}`;
            const jwtToken = getJwt();
            let headers;
            if (jwtToken !== "") {
                headers = new Headers();
                headers.set("Authorization", `Bearer ${jwtToken}`);
            }
            const response = await safeFetch(url, {
                headers,
            });
            if (response instanceof Error) {
                return response;
            }
            return handleResponse<Account>(response);
        } else if (args.username) {
            const url = copyURL(urlArg);
            url.pathname = `/getAccount/${args.username}`;
            const response = await safeFetch(url);
            if (response instanceof Error) {
                return response;
            }
            return handleResponse<Account>(response);
        } else {
            return new Error("no npub or username provided");
        }
    };

export const getAccountFollowings =
    (urlArg: URL) => async (args: { npub: string; page: number; limit: number }) => {
        const url = copyURL(urlArg);
        url.pathname = `/getAccountFollowings/${args.npub}`;
        url.searchParams.append("limit", JSON.stringify(args.limit));
        url.searchParams.append("page", JSON.stringify(args.page));
        const response = await safeFetch(url);
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<AccountDTO[]>(response);
    };

export const getAccountFollowers =
    (urlArg: URL) => async (args: { npub: string; page: number; limit: number }) => {
        const url = copyURL(urlArg);
        url.pathname = `/getAccountFollowers/${args.npub}`;
        url.searchParams.append("limit", JSON.stringify(args.limit));
        url.searchParams.append("page", JSON.stringify(args.page));
        const response = await safeFetch(url);
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<AccountDTO[]>(response);
    };

export const login = (urlArg: URL) => async (args: { username: string; password: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/login`;
    const response = await safeFetch(url, {
        method: "POST",
        body: JSON.stringify(args),
    });
    if (response instanceof Error) {
        return response;
    }
    const result = await handleResponse<{ account: Account; token: string }>(response);
    if (result instanceof ApiError) {
        if (result.status == 404) {
            return undefined;
        } else if (result.status == 401 && result.message == "Account is blacklisted") {
            return new Error("blacklisted");
        } else if (result.status == 401) {
            return "invalid password";
        }
    }
    return result;
};

export const createAccount =
    (urlArg: URL) => async (args: { username: string; password: string; email: string }) => {
        const url = copyURL(urlArg);
        url.pathname = `/createAccount`;
        const response = await safeFetch(url, {
            method: "POST",
            body: JSON.stringify(args),
        });
        if (response instanceof Error) {
            return response;
        }
        const res = await handleResponse<{ status: "success" }>(response);
        if (res instanceof Error) {
            return res;
        }
        if (res.status == "success") {
            return true;
        }
        return new Error("unexpected result", { cause: res });
    };

export const initiatePasswordReset = (urlArg: URL) => async (args: { username: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/initiatePasswordReset`;
    const response = await safeFetch(url, {
        method: "PUT",
        body: JSON.stringify({
            username: `${args.username}`,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ success: boolean }>(response);
};

export const checkUsernameAvailabilityInSatlantis = (urlArg: URL) => async (args: { name: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/isUserNameAvailable`;
    url.searchParams.set("name", args.name);

    const response = await safeFetch(url, {
        method: "GET",
    });

    if (response instanceof Error) {
        return response;
    }
    return handleResponse<string>(response);
};

export const resetPassword = (urlArg: URL) => async (args: { token: string; password: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/resetPassword`;
    const response = await safeFetch(url, {
        method: "PUT",
        body: JSON.stringify({
            password: args.password,
            token: args.token,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ success: boolean }>(response);
};

export const verifyEmail = (urlArg: URL) => async (args: { token: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/verifyEmail/${args.token}`;
    const response = await safeFetch(url, { method: "PUT" });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ success: boolean; account: Account; token: string }>(response);
};

export type GetAccountCalendarEventsArgs = {
    npub: string;
    period?: CalendarEventPeriod;
    rsvp?: 'waitlisted' | 'accepted';
};

export const getAccountCalendarEvents = (urlArg: URL) =>
async (
    args: GetAccountCalendarEventsArgs,
) => {
    const url = copyURL(urlArg);
    url.pathname = `/getAccountCalendarEvents/${args.npub}`;
    const period = args.period ?? CalendarEventPeriod.Upcoming;
    url.searchParams.set("period", period.toString());
    if (args.rsvp) {
      url.searchParams.set("rsvp", args.rsvp);
    }
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CalendarEvent[]>(response);
};

export const sendOTP = (urlArg: URL) => async (args: { email: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/auth/otp`;

    const response = await safeFetch(
        url,
        {
            method: "POST",
            body: JSON.stringify({
                ...args,
            }),
        },
    );
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        is_new_account: boolean; // Account was existing or new created
        message: string; // e.g. OTP code sent to your email
        success: boolean;
        token: string; // Token to use later for `/auth/otp/verify` endpoint
    }>(response);
};

export const sendEventSignup =
    (urlArg: URL) =>
    async (args: { email: string; calendarEventId: number; name: string; rsvpType: string }) => {
        const url = copyURL(urlArg);
        url.pathname = `/auth/otp`;

        const response = await safeFetch(
            url,
            {
                method: "POST",
                body: JSON.stringify({
                    ...args,
                }),
            },
        );
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<{
            is_new_account: boolean; // Account was existing or new created
            message: string; // e.g. confirm link sent to your email
            success: boolean;
            token: string; // Token to use later for `/auth/otp/verify` endpoint
        }>(response);
    };

export const verifyOTP = (urlArg: URL) => async (args: { token: string; otp: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/auth/otp/verify`;
    const response = await safeFetch(url, {
        method: "POST",
        body: JSON.stringify({
            ...args,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        account: Account;
        message: string; // e.g. OTP verification successful
        success: boolean;
        token: string; // JWT token that can be used as auth token
    }>(response);
};

export const getAccountById = (urlArg: URL) => async (args: { id: number }) => {
    const url = copyURL(urlArg);
    url.pathname = `/getAccountById/${args.id}`;

    const response = await safeFetch(url, { method: "GET" });

    if (response instanceof Error) {
        return response;
    }

    return handleResponse<SearchAccountDTO>(response);
};
