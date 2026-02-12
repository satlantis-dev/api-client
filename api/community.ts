import type { AccountDTO, func_GetJwt } from "@satlantis/api-client";
import { safeFetch } from "../helpers/safe-fetch.ts";
import { copyURL, handleResponse } from "../helpers/_helper.ts";
import type { Community, CommunityNewsletter } from "../models/community.ts";

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

export const listCommunityMembers = (
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
    url.pathname = `/secure/communities/${args.communityId}/members`;

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
    contentJson?: JSON;
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
    return handleResponse<{
        message: string;
    }>(response);
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
    return handleResponse<{
        newsletter: Record<string, unknown>;
    }>(response);
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
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{
        previewUrl: string;
    }>(response);
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
        message: string;
    }>(response);
};
