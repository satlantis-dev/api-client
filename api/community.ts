import type { Calendar, CalendarEvent, func_GetJwt } from "@satlantis/api-client";
import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { PaymentMethod } from "../models/order.ts";
import type {
    Community,
    CommunityFAQ,
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

export type MembershipTierPayload = {
    name: string;
    description?: string;
    blurb?: string;
    buttonText?: string;
    registrationQuestions?: Record<string, unknown>;
    isGated?: boolean;
    isPaid?: boolean;
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

export type CancelPendingMembershipSubscriptionArgs = {
    communityId: number;
    subscriptionId: number;
};

export const cancelPendingMembershipSubscription = (
    urlArg: URL,
    getJwt: func_GetJwt,
) =>
async (args: CancelPendingMembershipSubscriptionArgs) => {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${args.communityId}/subscriptions/${args.subscriptionId}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);

    const response = await safeFetch(url, {
        method: "DELETE",
        headers,
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
