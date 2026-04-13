import type { func_GetJwt } from "@satlantis/api-client";
import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Community, CommunityMember, CommunityNewsletter } from "../models/community.ts";

export const createCommunityFromCalendar = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: {
    calendarId: number;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/calendar/${args.calendarId}/community`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "POST",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Community>(response);
};

export const getCommunityById = (
    urlArg: URL,
) =>
async (args: {
    communityId: number;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/communities/${args.communityId}`;
    const response = await safeFetch(url, {
        method: "GET",
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Community>(response);
};

export type CommunityMemberExtended = CommunityMember & {
    numEvents: number;
    revenue: number;
};

export const listCommunityMembers = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: {
    communityId: number;
    order?: "date_desc" | "date_asc" | "num_events" | "revenue";
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/members`;
    if (args.order) {
        url.searchParams.set("order", args.order);
    }

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityMemberExtended[]>(response);
};

export const addMembersToCommunity = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: {
    communityId: number;
    accountIds: number[];
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/members`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
            accountIds: args.accountIds,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        message: string;
    }>(response);
};

export const removeMembersFromCommunity = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: {
    communityId: number;
    memberIds: number[];
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/members`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "DELETE",
        headers,
        body: JSON.stringify({
            memberIds: args.memberIds,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        message: string;
    }>(response);
};

export const createCommunityNewsletter = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: {
    communityId: number;
    subject: string;
    contentHtml: string;
    contentJson?: Record<string, unknown>;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/newsletters`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
            subject: args.subject,
            contentJson: args.contentJson,
            contentHtml: args.contentHtml,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Community>(response);
};

export const updateCommunityNewsletter = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: {
    communityId: number;
    newsletterId: number;
    subject?: string;
    contentJson?: JSON;
    contentHtml?: string;
    scheduledFor?: string;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/newsletters/${args.newsletterId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify({
            subject: args.subject,
            contentJson: args.contentJson,
            contentHtml: args.contentHtml,
            scheduledFor: args.scheduledFor,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        message: string;
    }>(response);
};

export const deleteCommunityNewsletter = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: {
    communityId: number;
    newsletterId: number;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/newsletters/${args.newsletterId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "DELETE",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        message: string;
    }>(response);
};

export const getCommunityNewsletter = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: {
    communityId: number;
    newsletterId: number;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/newsletters/${args.newsletterId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityNewsletter>(response);
};

export const getCommunityNewsletters = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: {
    communityId: number;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/newsletters`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityNewsletter[]>(response);
};

export const previewCommunityNewsletter = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: {
    communityId: number;
    newsletterId: number;
    email: string;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/newsletters/${args.newsletterId}/preview`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
            email: args.email,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<string>(response);
};

export const sendCommunityNewsletter = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: {
    communityId: number;
    newsletterId: number;
}) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/newsletters/${args.newsletterId}/send`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "POST",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        status: string;
    }>(response);
};
