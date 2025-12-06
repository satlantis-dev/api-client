import type { func_GetJwt } from "@satlantis/api-client";
import { ApiError, copyURL, InvalidJSON, parseJSON } from "../../helpers/_helper.ts";
import { Aborted, type FetchResult, safeFetch } from "../../helpers/safe-fetch.ts";
import type { EventOrderPaymentHistory } from "../../models/event.ts";
import type { RefundOrderResponse } from "../../models/order.ts";

const handleResponse = async <T extends {}>(response: FetchResult) => {
    const body = await response.text();
    if (body instanceof Aborted) {
        return body;
    }

    // 200-299 is success.
    if (response.status < 200 || response.status >= 300) {
        return new ApiError(response.status, body);
    }
    if (!body) {
        return {} as T;
    }
    const result = parseJSON<T>(body);
    if (result instanceof InvalidJSON) {
        return result;
    }
    return result as T;
};

const createSecureUrl = (urlArg: URL, path: string) => {
    const url = copyURL(urlArg);
    url.pathname = `/secure${path}`;
    return url;
};

export type GetSingleORderHistoryArgs = {
    orderId: number;
};

export const getSingleOrderHistory = (urlArg: URL, getJwt: func_GetJwt) => {
    return async (args: GetSingleORderHistoryArgs) => {
        const url = createSecureUrl(urlArg, `/orders/${args.orderId}/history`);

        const jwtToken = getJwt();
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) {
            return response;
        }

        return handleResponse<EventOrderPaymentHistory>(response);
    };
};

export type RefundOrderArgs = {
    orderId: number;
    amount: number; // min 1
    lightningAddress?: string; // required if payment method is lightning
    markAsNotGoing: boolean;
    reason?: string;
};

export const refundOrder = (urlArg: URL, getJwt: func_GetJwt) => {
    return async ({ orderId, ...refundArgs }: RefundOrderArgs) => {
        const url = createSecureUrl(urlArg, `/orders/${orderId}/refund`);

        const jwtToken = getJwt();
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(refundArgs),
        });

        if (response instanceof Error) {
            return response;
        }

        return handleResponse<RefundOrderResponse>(response);
    };
};

export type RefundStatusArgs = {
    refundId: number;
};

export const getRefundStatus = (urlArg: URL, getJwt: func_GetJwt) => {
    return async (args: RefundStatusArgs) => {
        const url = createSecureUrl(urlArg, `/refunds/${args.refundId}`);

        const jwtToken = getJwt();
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) {
            return response;
        }

        return handleResponse<RefundOrderResponse>(response);
    };
};

export type RefundFeeEstimationArgs = {
    orderId: number;
    amount: number;
    lightning_address: string;
};

export type RefundFeeEstimationResponse = {
    fee: number;
    maxRefundableAmount: number;
};

export const getRefundFeeEstimation = (urlArg: URL, getJwt: func_GetJwt) => {
    return async (args: RefundFeeEstimationArgs) => {
        const url = createSecureUrl(urlArg, `/orders/${args.orderId}/refund/fee-estimation`);

        url.searchParams.set("amount", args.amount.toString());
        url.searchParams.set("lightning_address", args.lightning_address);

        const jwtToken = getJwt();
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) {
            return response;
        }

        return handleResponse<RefundFeeEstimationResponse>(response);
    };
};
