// Premium plans (Starter / Growth / Pro) and the account's subscription to them.
// Monetary amounts are in minor currency units (cents for USD).

// A subscription plan returned by `GET /plans`.
export type Plan = {
    readonly id: number;
    readonly name: string;
    readonly currency: string;
    readonly monthlyAmount?: number;
    readonly yearlyAmount?: number;
    readonly btcDiscountPercentage?: number;
    readonly rank: number;
    readonly trialDays: number;
    readonly isPaid: boolean;
    readonly isHidden: boolean;
    readonly isActive: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
};

export type PlanPeriod = "monthly" | "annual";
export type PlanPaymentMethod = "stripe" | "lightning" | "onchain";
export type PlanSubscriptionStatus = "pending_payment" | "active" | "past_due" | "cancelled" | (string & {});

// A change scheduled on an active subscription for the end of its billing period
// (a downgrade, or a switch between monthly and annual).
export type PlanSubscriptionChange = {
    id: number;
    changeType: "plan_change" | "period_change" | (string & {});
    status: "pending" | "applied" | "cancelled" | (string & {});
    newPlanId?: number;
    newPlan?: Plan;
    newPeriod?: PlanPeriod;
};

export type PlanSubscription = {
    id: number;
    planId: number;
    period: PlanPeriod;
    status: PlanSubscriptionStatus;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    paymentMethod?: PlanPaymentMethod;
    amount?: number;
    currency?: string;
    // Used instead of `amount` for the single next charge (a coupon's first period, an upgrade's
    // prorated credit), in the same currency; cleared once that charge resolves.
    nextChargeAmountOverride?: number | null;
    cardLast4?: string;
    scheduledChanges?: PlanSubscriptionChange[];
};

// The account's plan (`GET /secure/user/plans`). Accounts without a record get Starter.
export type PlanMember = {
    accountId: number;
    planId: number;
    plan: Plan;
    openPlanSubscriptions?: PlanSubscription[];
};

export type PlanCouponPreview = {
    valid: boolean;
    errorCode?: string;
    error?: string;
    couponCode?: string;
    totalDiscount?: number;
    finalTotal?: number;
    originalTotal?: number;
    currency?: string;
};

export type PlanCardSetup = {
    subscriptionId: number;
    clientSecret: string;
    setupIntentId: string;
    stripeCustomerId: string;
    stripePublishableKey: string;
};

export type PlanCardSetupConfirmation = {
    setupIntentStatus: string;
    subscription: PlanSubscription;
};

export type PlanLightningInvoice = {
    subscriptionId: number;
    paymentRequest: string;
    paymentHash: string;
    amountSats: number;
};

export type PlanOnchainPayment = {
    subscriptionId: number;
    address: string;
    paymentUri: string;
    amountSats: number;
    receivedSats: number;
    remainingSats: number;
    expiresAt: string;
};

// State of a subscription's latest payment, whatever its method.
export type PlanPaymentStatus = {
    subscriptionId: number;
    subscriptionStatus: PlanSubscriptionStatus;
    paymentId: number;
    paymentMethod: PlanPaymentMethod;
    status: "pending" | "paid" | "failed" | "expired" | (string & {});
    amount: number;
    currency: string;
    expiresAt?: string | null;
    paidAt?: string | null;
    failedAt?: string | null;
    paymentRequest?: string;
    onchainAddress?: string;
    onchainUri?: string;
    onchainTxId?: string;
    onchainConfirmations?: number;
    onchainReceivedSats?: number;
    onchainRemainingSats?: number;
};
