import type { Calendar, CalendarEvent, func_GetJwt } from "@satlantis/api-client";
import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type {
    Community,
    CommunityMember,
    CommunityNewsletter,
    CommunityUserPermission,
} from "../models/community.ts";

export type CreateCommunityFromCalendarArgs = {
    calendarId: number;
};

export const createCommunityFromCalendar = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: CreateCommunityFromCalendarArgs) => {
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

export type GetCommunityByIdArgs = {
    communityId: number;
};

export const getCommunityById = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: GetCommunityByIdArgs) => {
    const url = copyURL(urlArg);
    url.pathname = `/communities/${args.communityId}`;
    const headers = new Headers();
    const jwtToken = getJwt();
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }
    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Community>(response);
};

export type GetCommunityUserPermissionArgs = {
    communityId: number;
};

export const getCommunityUserPermission = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: GetCommunityUserPermissionArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/user/permissions/communities/${args.communityId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityUserPermission>(response);
};

export type ListCommunityMembersArgs = {
    communityId: number;
    order?: "date_desc" | "date_asc" | "num_events" | "revenue";
};

export type CommunityMemberExtended = CommunityMember & {
    numEvents: number;
    revenue: number;
};

export const listCommunityMembers = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: ListCommunityMembersArgs) => {
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

export type AddMembersToCommunityArgs = {
    communityId: number;
    accountIds: number[];
};

export const addMembersToCommunity = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: AddMembersToCommunityArgs) => {
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

export type RemoveMembersFromCommunityArgs = {
    communityId: number;
    memberIds: number[];
};

export const removeMembersFromCommunity = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: RemoveMembersFromCommunityArgs) => {
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

export type CreateCommunityNewsletterArgs = {
    communityId: number;
    subject: string;
    contentHtml: string;
    contentJson?: Record<string, unknown>;
};

export const createCommunityNewsletter = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: CreateCommunityNewsletterArgs) => {
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

export type UpdateCommunityNewsletterArgs = {
    communityId: number;
    newsletterId: number;
    subject?: string;
    contentJson?: Record<string, unknown>;
    contentHtml?: string;
    scheduledFor?: string;
};

export const updateCommunityNewsletter = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: UpdateCommunityNewsletterArgs) => {
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

export type DeleteCommunityNewsletterArgs = {
    communityId: number;
    newsletterId: number;
};

export const deleteCommunityNewsletter = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: DeleteCommunityNewsletterArgs) => {
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

export type GetCommunityNewsletterArgs = {
    communityId: number;
    newsletterId: number;
};

export const getCommunityNewsletter = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: GetCommunityNewsletterArgs) => {
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

export type GetCommunityNewslettersArgs = {
    communityId: number;
};

export const getCommunityNewsletters = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: GetCommunityNewslettersArgs) => {
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

export type PreviewCommunityNewsletterArgs = {
    communityId: number;
    newsletterId: number;
    email: string;
};

export const previewCommunityNewsletter = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: PreviewCommunityNewsletterArgs) => {
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

export type SendCommunityNewsletterArgs = {
    communityId: number;
    newsletterId: number;
};

export const sendCommunityNewsletter = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: SendCommunityNewsletterArgs) => {
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

export type GetCommunityCalendarEventsArgs = {
    communityId: number;
    period?: "past" | "upcoming" | "all";
};

export const getCommunityCalendarEvents = (
    urlArg: URL,
) =>
async (args: GetCommunityCalendarEventsArgs) => {
    const url = copyURL(urlArg);
    url.pathname = `/communities/${args.communityId}/calendars/events`;
    if (args.period) {
        url.searchParams.set("period", args.period);
    }

    const response = await safeFetch(url, {
        method: "GET",
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Calendar[]>(response);
};
