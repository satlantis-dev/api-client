import type { AccountDTO, SearchAccountDTO } from "@satlantis/api-client";
import type { Calendar } from "./calendar.ts";
import type { PaymentMethod } from "./order.ts";
import type { OrderCurrency } from "./ticketing.ts";

export type Community = {
    id: number;
    name: string;
    bio?: string; // shown in the public view
    blurb?: string; // shown in the member view
    notice?: string; // shown in the member view, not returned in the public view
    description?: string;
    banner?: string;
    accountId: number;
    account?: AccountDTO;
    faq?: CommunityFAQ[];
    socialLinks: Record<string, unknown>;
    chatLinks?: Record<string, unknown>; // shown in the member view, not returned in the public view
    memberCount?: number;
    tiers?: CommunityMembershipTier[];
    gallery?: CommunityGalleryImage[];
    calendars?: Calendar[];
    theme?: CommunityTheme;
    members?: CommunityMember[];
    newsletters?: CommunityNewsletter[];
    sampleMembers: SearchAccountDTO[]; // a sample top-N subset (ranked by follower count)
    logo?: string;
    whopId?: string;
    // Community-level currency (USD default). Source of truth for all paid tier pricing;
    // tiers no longer store their own currency. Changed via changeCommunityCurrency.
    currency?: OrderCurrency | null;
};

export type CommunityTheme = {
    id: number;
    name: string;
    backgroundColor: string;
    foregroundColor: string;
    rank?: number;
};

export type CommunityFAQ = {
    question: string;
    answer: string;
};

export interface CommunityGalleryImage {
    id: number;
    communityId: number;
    url: string;
    rank: number;
    createdAt: string;
}

export interface CommunityMembershipTier {
    id: number;
    communityId: number;
    community?: Community;
    name: string;
    description?: string;
    blurb?: string;
    buttonText?: string;
    registrationQuestions?: Record<string, unknown>;
    isGated: boolean;
    isPaid: boolean;
    isRecommended: boolean;
    currency?: OrderCurrency | null;
    monthlyAmount?: number | null;
    yearlyAmount?: number | null;
    trialDays?: number | null;
    rank: number;
    createdAt: string;
    updatedAt: string;
}

export enum NewsletterStatus {
    DRAFT = "draft",
    SCHEDULED = "scheduled",
    SENDING = "sending",
    SENT = "sent",
    FAILED = "failed",
}

export type CommunityNewsletter = {
    id: number;
    communityId: number;
    community?: Community;
    accountId: number;
    account?: AccountDTO;
    contentJson?: Record<string, unknown>;
    contentHtml?: string;
    subject: string;
    status: NewsletterStatus;
    scheduledFor?: string;
    sentAt?: string;
    createdAt: string;
    updatedAt: string;
};

export type CommunityMember = {
    id: number;
    communityId: number;
    community?: Community;
    accountId: number;
    account: AccountDTO;
    tierId?: number | null;
    tier?: CommunityMembershipTier | null;
    openSubscriptions?: CommunityMembershipSubscription[] | null;
    openRequests?: CommunityMembershipRequest[] | null;
    registrationAnswers?: Record<string, unknown> | null;
    startDate?: string | null;
    expiryDate?: string | null;
    isExpired?: boolean;
    isBanned?: boolean;
    isCommunityAdmin?: boolean;
    adminInvitationReceivedAt?: string | null;
    adminInvitationAcceptedAt?: string | null;
    adminInvitationDeclinedAt?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CommunityUserPermission = CommunityMember & {
    tierId?: number | null;
    isCommunityAdmin: boolean;
};

// Community organizer roles live in the `account_community_roles` table,
// separate from membership. Only "admin" is supported initially; more role
// types can be added here as the backend grows them.
export type AccountCommunityRoleType = "admin";

export type AccountCommunityRole = {
    accountId: number;
    account: AccountDTO;
    communityId: number;
    community?: Community;
    type: AccountCommunityRoleType;
    invitationReceivedAt?: string | null;
    invitationAcceptedAt?: string | null;
    invitationDeclinedAt?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type Theme = {
    id: number;
    name: string;
    backgroundColor: string;
    foregroundColor: string;
    rank?: number;
};

export enum CommunityMembershipPeriod {
    MONTHLY = "monthly",
    ANNUAL = "annual",
}

export enum CommunityMembershipRequestStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    CANCELLED = "cancelled",
    IMPLEMENTED = "implemented",
}

export enum CommunityMembershipSubscriptionStatus {
    PENDING_APPROVAL = "pending_approval",
    PENDING_PAYMENT = "pending_payment",
    ACTIVE = "active",
    PAST_DUE = "past_due",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
}

export type CommunityMembershipRequest = {
    id: number;
    communityId: number;
    accountId: number;
    account?: AccountDTO;
    currentTierId?: number | null;
    currentTier?: CommunityMembershipTier | null;
    requestedTierId: number;
    requestedTier?: CommunityMembershipTier | null;
    status: CommunityMembershipRequestStatus;
    registrationAnswers?: Record<string, unknown> | null;
    period?: CommunityMembershipPeriod | null;
    paymentMethod?: PaymentMethod | null;
    reviewedByAccountId?: number | null;
    reviewedByAccount?: AccountDTO | null;
    reviewNotes?: string | null;
    reviewedAt?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CommunityMembershipSubscription = {
    id: number;
    communityId: number;
    accountId: number;
    tierId: number;
    status: CommunityMembershipSubscriptionStatus;
    period: CommunityMembershipPeriod;
    paymentMethod?: PaymentMethod | null;
    cancelAtPeriodEnd?: boolean;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
};

export type CommunityMembershipSubscriptionChange = {
    id: number;
    subscriptionId: number;
    period?: CommunityMembershipPeriod | null;
    paymentMethod?: PaymentMethod | null;
    effectiveAt?: string | null;
    createdAt: string;
    updatedAt: string;
};
