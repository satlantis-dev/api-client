import type { AccountDTO, SearchAccountDTO } from "@satlantis/api-client";
import type { Calendar } from "./calendar.ts";
import type { PaymentMethod, PaymentStatus, RefundStatus } from "./order.ts";
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
    // Payment methods the community accepts, independent of the pricing currency.
    // "lightning" => accepts BTC even when currency is fiat; "stripe" => accepts fiat
    // even when currency is BTC. Defaults to ["stripe"] (["lightning"] for BTC currency).
    paymentMethods?: PaymentMethod[];
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
    isInvited?: boolean | null;
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

export enum CommunityMembershipRequestType {
    NEW = "new",
    UPGRADE = "upgrade",
    DOWNGRADE = "downgrade",
    PERIOD_CHANGE = "period_change",
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
    type?: CommunityMembershipRequestType;
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
    cardLast4?: string;
    cardBrand?: string;
    cardExpMonth?: number;
    cardExpYear?: number;
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

export type CommunityMembershipPayment = {
    id: number;
    subscriptionId: number;
    paymentMethod?: PaymentMethod | null;
    status: PaymentStatus;
    amount: number;
    currency: OrderCurrency;
    cardLast4?: string;
    cardBrand?: string;
    lightningPreimage?: string;
    stripePaymentIntentId?: string;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
};

export type CommunityMembershipRefund = {
    id: number;
    paymentId: number;
    amount: number;
    currency: OrderCurrency;
    fee?: number;
    reason?: string;
    refundMethod?: string;
    lightningPreimage?: string;
    status: RefundStatus;
    processedAt?: string;
    failedAt?: string;
    failureReason?: string;
    createdAt: string;
};

// Subscription with its relations (buyer identity, tier) populated, as returned
// by GET /communities/{id}/subscriptions/{subscriptionId}. Relation fields are
// optional because the backend only fills the ones it preloads.
export type CommunityMembershipSubscriptionDetail =
    & CommunityMembershipSubscription
    & {
        account?: AccountDTO | null;
        member?: CommunityMember | null;
        tier?: CommunityMembershipTier | null;
    };

// Payment as returned by GET /secure/communities/{id}/financials/transactions.
export type CommunityFinancialTransactionPayment = CommunityMembershipPayment & {
    subscription?: CommunityMembershipSubscriptionDetail | null;
    refunds?: CommunityMembershipRefund[] | null;
};

export type CommunityFinancialTransactionKind = "payment" | "refund";

export type CommunityFinancialTransaction = {
    type: CommunityFinancialTransactionKind;
    timestamp: string;
    payment?: CommunityFinancialTransactionPayment | null;
    refund?:
        | (CommunityMembershipRefund & {
            payment?: CommunityFinancialTransactionPayment | null;
        })
        | null;
    // Resolved server-side from the payment's subscription (displayName →
    // name → nip05 → username → shortened npub). Empty string when the
    // backend can't resolve them; absent on pre-2026-07-10 deploys.
    tierName?: string;
    accountName?: string;
};

export type CommunityFinancialTransactionsResponse = {
    page: number;
    limit: number;
    total: number;
    transactions: CommunityFinancialTransaction[];
};

// GET /secure/communities/{id}/financials/summary. All monetary values are in
// the community's master currency's smallest unit (cents / sats) at the
// current exchange rate; `currency` names that master currency.
export type CommunityTierStats = {
    tierId: number;
    name: string;
    rank: number;
    members: number;
    mrr: number;
    totalEarnings: number;
    totalBTCEarnings: number;
};

export type CommunityMonthlyStats = {
    month: string; // "YYYY-MM"
    revenue: number;
    btcEarnings: number;
    activeSubscriptions: number;
    terminatedSubscriptions: number;
};

export type CommunityFinancialSummary = {
    currency: OrderCurrency;
    mrr: number;
    totalEarnings: number;
    totalBTCEarnings: number;
    activeSubscriptions: number;
    terminatedSubscriptions: number;
    tierStats?: CommunityTierStats[] | null;
    monthlyStats?: CommunityMonthlyStats[] | null;
};

// Payment annotated with its subscription's tier name, as returned by
// GET /secure/user/communities/{communityId}/payments. tierName is "" when
// the backend can't resolve the tier.
export type CommunityMembershipPaymentWithTier = CommunityMembershipPayment & {
    tierName: string;
};

export type UserCommunityMembershipPaymentsResponse = {
    page: number;
    limit: number;
    total: number;
    payments: CommunityMembershipPaymentWithTier[];
};
