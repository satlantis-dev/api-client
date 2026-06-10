import type { Calendar, CalendarEvent, func_GetJwt } from "@satlantis/api-client";
import type { AccountSearchDTO, SearchAccountDTO } from "../models/account.ts";
import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { PaymentMethod } from "../models/order.ts";
import type {
    Community,
    CommunityFAQ,
    CommunityGalleryImage,
    CommunityMember,
    CommunityMembershipPeriod,
    CommunityMembershipRequest,
    CommunityMembershipRequestStatus,
    CommunityMembershipSubscription,
    CommunityMembershipSubscriptionChange,
    CommunityMembershipTier,
    CommunityNewsletter,
    CommunityUserPermission,
} from "../models/community.ts";
import type { OrderCurrency } from "../models/ticketing.ts";

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

export type ListCommunityAdminsArgs = {
    communityId: number;
    order?: "date_desc" | "date_asc" | "num_events" | "revenue";
};

export type ListCommunityAdminsResponse = {
    admins: CommunityMemberExtended[];
    invited: CommunityMemberExtended[];
    declined: CommunityMemberExtended[];
};

export type InviteCommunityAdminArgs = {
    communityId: number;
    inviteeId?: number;
    inviteeEmail?: string;
};

export type RespondCommunityAdminInvitationArgs = {
    communityId: number;
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

export const listCommunityAdmins = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: ListCommunityAdminsArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/admins`;
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
    return handleResponse<ListCommunityAdminsResponse>(response);
};

export const inviteCommunityAdmin = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: InviteCommunityAdminArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/admins/invite`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const body = args.inviteeEmail ? { inviteeEmail: args.inviteeEmail } : { inviteeId: args.inviteeId };

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ message: string }>(response);
};

export const acceptCommunityAdminInvitation = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: RespondCommunityAdminInvitationArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/admins/accept-invitation`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ message: string }>(response);
};

export const declineCommunityAdminInvitation = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: RespondCommunityAdminInvitationArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/admins/decline-invitation`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ message: string }>(response);
};

export type LinkCalendarToCommunityArgs = {
    communityId: number;
    calendarId: number;
};

export const linkCalendarToCommunity = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: LinkCalendarToCommunityArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/calendars/${args.calendarId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<string>(response);
};

export type UnlinkCalendarFromCommunityArgs = {
    communityId: number;
    calendarId: number;
};

export const unlinkCalendarFromCommunity = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: UnlinkCalendarFromCommunityArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/calendars/${args.calendarId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "DELETE",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<string>(response);
};

export type SetMemberAdminArgs = {
    communityId: number;
    memberId: number;
};

export const setMemberAdmin = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: SetMemberAdminArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/members/${args.memberId}/admin`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<string>(response);
};

export type UnsetMemberAdminArgs = {
    communityId: number;
    memberId: number;
};

export const unsetMemberAdmin = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: UnsetMemberAdminArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/members/${args.memberId}/unadmin`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<string>(response);
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
    accountIds: number[];
    // "remove" (default) soft-deletes the record; "prospect" strips the tier
    // but keeps the record; "ban" soft-deletes and sets isBanned = true.
    // Non-managers may only remove themselves: accountIds must contain
    // exactly their own account ID.
    mode?: "remove" | "prospect" | "ban";
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
            accountIds: args.accountIds,
            ...(args.mode ? { mode: args.mode } : {}),
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
    getJwt: func_GetJwt,
) =>
async (args: GetCommunityCalendarEventsArgs) => {
    const url = copyURL(urlArg);
    url.pathname = `/communities/${args.communityId}/calendars/events`;
    if (args.period) {
        url.searchParams.set("period", args.period);
    }

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
    return handleResponse<Calendar[]>(response);
};

export type GetPublicCommunityAdminsArgs = {
    communityId: number;
};

export const getPublicCommunityAdmins = (urlArg: URL) =>
    async (args: GetPublicCommunityAdminsArgs) => {
        const url = copyURL(urlArg);
        url.pathname = `/communities/${args.communityId}/admins`;
        const response = await safeFetch(url, { method: "GET" });
        if (response instanceof Error) return response;
        return handleResponse<SearchAccountDTO[]>(response);
    };

export type GetCommunityEventsArgs = {
    communityId: number;
    period?: "past" | "upcoming" | "all";
};

export const getCommunityEvents = (
    urlArg: URL,
) =>
async (args: GetCommunityEventsArgs) => {
    const url = copyURL(urlArg);
    url.pathname = `/communities/${args.communityId}/events`;
    if (args.period) {
        url.searchParams.set("period", args.period);
    }

    const response = await safeFetch(url, {
        method: "GET",
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CalendarEvent[]>(response);
};

export type CreateCommunityArgs = {
    name: string;
    bio?: string;
    blurb?: string;
    description?: string;
    banner?: string;
    notice?: string;
    faq?: CommunityFAQ[];
    socialLinks?: Record<string, unknown>;
    chatLinks?: Record<string, unknown>;
    themeId?: number;
    logo?: string;
    whopId?: string;
};

export type GetCommunitiesArgs = {
    whopId?: string;
};

export const getCommunities = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: GetCommunitiesArgs): Promise<Community[] | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/communities`;
    if (args.whopId) url.searchParams.set("whopId", args.whopId);

    const headers = new Headers();
    const jwtToken = getJwt();
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, { method: "GET", headers });
    if (response instanceof Error) return response;

    const result = await handleResponse<Community[] | Community>(response);
    if (result instanceof Error) return result;

    return Array.isArray(result) ? result : [result];
};

export const createCommunity = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: CreateCommunityArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(args),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Community>(response);
};

export type UpdateCommunityArgs = {
    communityId: number;
    name?: string;
    bio?: string;
    blurb?: string;
    description?: string;
    banner?: string;
    notice?: string;
    faq?: CommunityFAQ[];
    socialLinks?: Record<string, string>;
    chatLinks?: Record<string, string>;
    themeId?: number;
    logo?: string;
    whopId?: string;
};

export const updateCommunity = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: UpdateCommunityArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const { communityId, ...body } = args;
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${communityId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Community>(response);
};

export type MembershipTierPayload = {
    name: string;
    description?: string;
    blurb?: string;
    buttonText?: string;
    registrationQuestions?: Record<string, unknown>;
    isGated?: boolean;
    isPaid?: boolean;
    isRecommended?: boolean;
    currency?: OrderCurrency;
    monthlyAmount?: number;
    yearlyAmount?: number;
    rank?: number;
};

export type CreateCommunityMembershipTierArgs = MembershipTierPayload & {
    communityId: number;
};

export const createCommunityMembershipTier = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: CreateCommunityMembershipTierArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/tiers`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const { communityId: _communityId, ...payload } = args;

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityMembershipTier>(response);
};

export type UpdateCommunityMembershipTierArgs = Partial<MembershipTierPayload> & {
    communityId: number;
    tierId: number;
};

export const updateCommunityMembershipTier = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: UpdateCommunityMembershipTierArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/tiers/${args.tierId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const { communityId: _communityId, tierId: _tierId, ...payload } = args;

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityMembershipTier>(response);
};

export type DeleteCommunityMembershipTierArgs = {
    communityId: number;
    tierId: number;
};

export const deleteCommunityMembershipTier = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: DeleteCommunityMembershipTierArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/tiers/${args.tierId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "DELETE",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ message: string }>(response);
};

/////////////////////////// Membership Requests ///////////////////////////

export type SubmitCommunityMembershipRequestArgs = {
    communityId: number;
    tierId: number;
    registrationAnswers?: Record<string, unknown>;
    // Required when the requested tier is paid.
    period?: CommunityMembershipPeriod;
    paymentMethod?: PaymentMethod;
};

export type SubmitCommunityMembershipRequestResponse = {
    request: CommunityMembershipRequest;
    subscription?: CommunityMembershipSubscription;
    subscriptionChange?: CommunityMembershipSubscriptionChange;
};

export const submitCommunityMembershipRequest = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: SubmitCommunityMembershipRequestArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/requests`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
            tierId: args.tierId,
            registrationAnswers: args.registrationAnswers,
            period: args.period,
            paymentMethod: args.paymentMethod,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<SubmitCommunityMembershipRequestResponse>(response);
};

export type GetCommunityMembershipRequestsArgs = {
    communityId: number;
    status?: CommunityMembershipRequestStatus;
};

export const getCommunityMembershipRequests = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: GetCommunityMembershipRequestsArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/requests`;
    if (args.status) {
        url.searchParams.set("status", args.status);
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
    return handleResponse<CommunityMembershipRequest[]>(response);
};

type ReviewCommunityMembershipRequestArgs = {
    communityId: number;
    requestId: number;
    notes?: string;
};

export type AcceptCommunityMembershipRequestArgs = ReviewCommunityMembershipRequestArgs;
export type RejectCommunityMembershipRequestArgs = ReviewCommunityMembershipRequestArgs;
export type CancelCommunityMembershipRequestArgs = ReviewCommunityMembershipRequestArgs;

const reviewCommunityMembershipRequest = (
    urlArg: URL,
    getJwt: func_GetJwt,
    method: "PUT" | "DELETE",
    action: "accept" | "reject" | "cancel",
) =>
async (args: ReviewCommunityMembershipRequestArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = action === "cancel"
        ? `/secure/communities/${args.communityId}/requests/${args.requestId}`
        : `/secure/communities/${args.communityId}/requests/${args.requestId}/${action}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method,
        headers,
        body: JSON.stringify({ notes: args.notes }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityMembershipRequest>(response);
};

export const acceptCommunityMembershipRequest = (
    urlArg: URL,
    getJwt: func_GetJwt,
) => reviewCommunityMembershipRequest(urlArg, getJwt, "PUT", "accept");

export const rejectCommunityMembershipRequest = (
    urlArg: URL,
    getJwt: func_GetJwt,
) => reviewCommunityMembershipRequest(urlArg, getJwt, "PUT", "reject");

export const cancelCommunityMembershipRequest = (
    urlArg: URL,
    getJwt: func_GetJwt,
) => reviewCommunityMembershipRequest(urlArg, getJwt, "DELETE", "cancel");

/////////////////////////// Membership Subscriptions ///////////////////////////

export type ModifyActiveMembershipSubscriptionArgs = {
    communityId: number;
    subscriptionId: number;
    period?: CommunityMembershipPeriod;
    cancelAtPeriodEnd?: boolean;
    paymentMethod?: PaymentMethod;
};

export const modifyActiveMembershipSubscription = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: ModifyActiveMembershipSubscriptionArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/subscriptions/${args.subscriptionId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify({
            period: args.period,
            cancelAtPeriodEnd: args.cancelAtPeriodEnd,
            paymentMethod: args.paymentMethod,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityMembershipSubscription>(response);
};

/////////////////////////// User-scoped reads ///////////////////////////

export type GetUserCommunityMembershipRequestsArgs = {
    communityId: number;
};

export const getUserCommunityMembershipRequests = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: GetUserCommunityMembershipRequestsArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/user/communities/${args.communityId}/requests`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityMembershipRequest[]>(response);
};

export const getUserCommunityMemberships = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async () => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/user/communities/members`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityMember[]>(response);
};

/////////////////////////// Community CRUD (delete) ///////////////////////////

export type DeleteCommunityArgs = {
    communityId: number;
};

export const deleteCommunity = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: DeleteCommunityArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "DELETE",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<string>(response);
};

/////////////////////////// Community discovery ///////////////////////////

export type SearchCommunitiesArgs = {
    search?: string;
    whopId?: string;
};

export const searchCommunities = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: SearchCommunitiesArgs) => {
    const url = copyURL(urlArg);
    url.pathname = `/communities`;
    if (args.search) {
        url.searchParams.set("search", args.search);
    }
    if (args.whopId) {
        url.searchParams.set("whopId", args.whopId);
    }

    const headers = new Headers();
    const jwtToken = getJwt();
    if (jwtToken != "") {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<Community[]>(response);
};

/////////////////////////// Membership tiers (read) ///////////////////////////

export type CommunityMembershipTierExtended = CommunityMembershipTier & {
    memberCount: number;
};

export type GetCommunityMembershipTiersArgs = {
    communityId: number;
};

export const getCommunityMembershipTiers = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: GetCommunityMembershipTiersArgs) => {
    const url = copyURL(urlArg);
    url.pathname = `/communities/${args.communityId}/tiers`;

    const headers = new Headers();
    const jwtToken = getJwt();
    if (jwtToken != "") {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityMembershipTierExtended[]>(response);
};

/////////////////////////// Community gallery ///////////////////////////

export type AddCommunityGalleryImageArgs = {
    communityId: number;
    url: string;
    rank?: number;
};

export const addCommunityGalleryImage = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: AddCommunityGalleryImageArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/images`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
            url: args.url,
            rank: args.rank,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityGalleryImage>(response);
};

export type UpdateCommunityGalleryImageRankArgs = {
    communityId: number;
    imageId: number;
    rank: number;
};

export const updateCommunityGalleryImageRank = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: UpdateCommunityGalleryImageRankArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/images/${args.imageId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify({
            rank: args.rank,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityGalleryImage>(response);
};

export type RemoveCommunityGalleryImageArgs = {
    communityId: number;
    imageId: number;
};

export const removeCommunityGalleryImage = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: RemoveCommunityGalleryImageArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/images/${args.imageId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "DELETE",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<string>(response);
};

export type GetCommunityGalleryImagesArgs = {
    communityId: number;
};

export const getCommunityGalleryImages = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: GetCommunityGalleryImagesArgs) => {
    const url = copyURL(urlArg);
    url.pathname = `/communities/${args.communityId}/images`;

    const headers = new Headers();
    const jwtToken = getJwt();
    if (jwtToken != "") {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        method: "GET",
        headers,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityGalleryImage[]>(response);
};

/////////////////////////// Community prospects ///////////////////////////

export type AddProspectsToCommunityArgs = {
    communityId: number;
    accountIds: number[];
};

export const addProspectsToCommunity = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: AddProspectsToCommunityArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/prospects`;

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
    return handleResponse<CommunityMember[]>(response);
};

export type ListCommunityProspectsArgs = {
    communityId: number;
    order?: "date_desc" | "date_asc" | "num_events" | "revenue";
    search?: string;
};

export const listCommunityProspects = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: ListCommunityProspectsArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/prospects`;
    if (args.order) {
        url.searchParams.set("order", args.order);
    }
    if (args.search) {
        url.searchParams.set("search", args.search);
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

/////////////////////////// Bulk member updates ///////////////////////////

export type UpdateMembershipsArgs = {
    communityId: number;
    accountIds: number[];
    upgradeTierId?: number;
    extendUntil?: string;
};

export const updateMemberships = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: UpdateMembershipsArgs) => {
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
        method: "PUT",
        headers,
        body: JSON.stringify({
            accountIds: args.accountIds,
            upgradeTierId: args.upgradeTierId,
            extendUntil: args.extendUntil,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityMember[]>(response);
};

export type InviteCommunityMembersArgs = {
    communityId: number;
    accountIds?: number[];
    emails?: string[];
};

export type CommunityInvitationResult = {
    invited: AccountSearchDTO[];
    alreadyMembers: AccountSearchDTO[];
    alreadyInvited: AccountSearchDTO[];
    failed: AccountSearchDTO[];
};

export const inviteCommunityMembers = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: InviteCommunityMembersArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/invitations`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
            accountIds: args.accountIds,
            emails: args.emails,
        }),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityInvitationResult>(response);
};

export type InviteCommunityMembersCSVArgs = {
    communityId: number;
    file: File;
};

export const inviteCommunityMembersCSV = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: InviteCommunityMembersCSVArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/invitations/csv`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const formData = new FormData();
    formData.append("file", args.file);

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: formData,
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<CommunityInvitationResult>(response);
};
