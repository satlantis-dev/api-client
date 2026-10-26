import type { func_GetJwt } from "../sdk.ts";
import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type {
    Plan,
    PlanCardSetup,
    PlanCardSetupConfirmation,
    PlanCouponPreview,
    PlanLightningInvoice,
    PlanMember,
    PlanOnchainPayment,
    PlanPaymentMethod,
    PlanPaymentStatus,
    PlanPeriod,
} from "../models/premium.ts";

// Premium plans: listing, the account's current plan, subscribing (upgrade or scheduled
// downgrade) and paying for a subscription by card (Stripe) or Bitcoin.

type Method = "GET" | "POST" | "DELETE";

// Authenticated JSON request shared by the secure premium routes below.
async function secureRequest<T extends {}>(
    urlArg: URL,
    getJwt: func_GetJwt,
    method: Method,
    pathname: string,
    body?: unknown,
) {
    const jwtToken = getJwt();
    if (jwtToken == "") {
        return new Error("jwt token is empty");
    }
    const url = copyURL(urlArg);
    url.pathname = pathname;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    if (body !== undefined) headers.set("Content-Type", "application/json");

    const response = await safeFetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<T>(response);
}

// GET /plans — every plan, including inactive ones (check `isActive`).
export const getPlans = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = "/plans";

    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }

    return handleResponse<Plan[]>(response);
};

// GET /secure/user/plans — the signed-in account's plan with its open subscriptions.
export const getUserPlan = (urlArg: URL, getJwt: func_GetJwt) => async () =>
    secureRequest<PlanMember>(urlArg, getJwt, "GET", "/secure/user/plans");

export type PreviewPlanCouponArgs = {
    planId: number;
    period: PlanPeriod;
    couponCode: string;
};

// POST /plans/coupon/preview — validates a coupon and returns the discounted total. Public, but
// sends the JWT when signed in so the single-use check runs against the account.
export const previewPlanCoupon = (urlArg: URL, getJwt?: func_GetJwt) => async (args: PreviewPlanCouponArgs) => {
    const url = copyURL(urlArg);
    url.pathname = "/plans/coupon/preview";

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    const jwtToken = getJwt?.() ?? "";
    if (jwtToken !== "") {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }

    const response = await safeFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(args),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<PlanCouponPreview>(response);
};

export type SubscribeToPlanArgs = {
    planId: number;
    // Required for paid plans; omitted to schedule a move to the unpaid Starter plan.
    period?: PlanPeriod;
    paymentMethod?: PlanPaymentMethod;
    couponCode?: string;
};

// POST /secure/plans/{planId}/subscribe — a higher-ranked paid plan creates a pending-payment
// subscription (replacing any earlier pending one); a lower-ranked plan, or the same plan with
// the other period, is scheduled for the end of the current billing period.
export const subscribeToPlan = (urlArg: URL, getJwt: func_GetJwt) => async (args: SubscribeToPlanArgs) => {
    const { planId, ...body } = args;
    return secureRequest<PlanMember>(urlArg, getJwt, "POST", `/secure/plans/${planId}/subscribe`, body);
};

export type PlanSubscriptionArgs = {
    subscriptionId: number;
};

// DELETE /secure/plans/subscriptions/{id}/scheduled-change — drops a pending downgrade or
// period change. Returns an empty object (204).
export const cancelScheduledPlanChange =
    (urlArg: URL, getJwt: func_GetJwt) => async (args: PlanSubscriptionArgs) =>
        secureRequest<Record<string, never>>(
            urlArg,
            getJwt,
            "DELETE",
            `/secure/plans/subscriptions/${args.subscriptionId}/scheduled-change`,
        );

// POST /secure/plans/subscriptions/{id}/setup-intent — starts saving a card with Stripe.
export const startPlanCardSetup = (urlArg: URL, getJwt: func_GetJwt) => async (args: PlanSubscriptionArgs) =>
    secureRequest<PlanCardSetup>(
        urlArg,
        getJwt,
        "POST",
        `/secure/plans/subscriptions/${args.subscriptionId}/setup-intent`,
    );

export type ConfirmPlanCardSetupArgs = PlanSubscriptionArgs & {
    setupIntentId: string;
};

// POST /secure/plans/subscriptions/{id}/setup-intent/confirm — after Stripe confirmed the card,
// charges it and returns the updated subscription.
export const confirmPlanCardSetup =
    (urlArg: URL, getJwt: func_GetJwt) => async (args: ConfirmPlanCardSetupArgs) =>
        secureRequest<PlanCardSetupConfirmation>(
            urlArg,
            getJwt,
            "POST",
            `/secure/plans/subscriptions/${args.subscriptionId}/setup-intent/confirm`,
            { setupIntentId: args.setupIntentId },
        );

// POST /secure/plans/subscriptions/{id}/lightning-invoice — a Lightning invoice for the payment.
export const startPlanLightningInvoice =
    (urlArg: URL, getJwt: func_GetJwt) => async (args: PlanSubscriptionArgs) =>
        secureRequest<PlanLightningInvoice>(
            urlArg,
            getJwt,
            "POST",
            `/secure/plans/subscriptions/${args.subscriptionId}/lightning-invoice`,
        );

// POST /secure/plans/subscriptions/{id}/onchain-address — an on-chain address for the payment.
export const startPlanOnchainPayment =
    (urlArg: URL, getJwt: func_GetJwt) => async (args: PlanSubscriptionArgs) =>
        secureRequest<PlanOnchainPayment>(
            urlArg,
            getJwt,
            "POST",
            `/secure/plans/subscriptions/${args.subscriptionId}/onchain-address`,
        );

// GET /secure/plans/subscriptions/{id}/payment — state of the subscription's latest payment.
export const getPlanPaymentStatus =
    (urlArg: URL, getJwt: func_GetJwt) => async (args: PlanSubscriptionArgs) =>
        secureRequest<PlanPaymentStatus>(
            urlArg,
            getJwt,
            "GET",
            `/secure/plans/subscriptions/${args.subscriptionId}/payment`,
        );
