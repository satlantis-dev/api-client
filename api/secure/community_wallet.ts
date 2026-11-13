import type { func_GetJwt } from "../../sdk.ts";
import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import type { CommunityWalletInfo } from "../../models/community.ts";
import type {
    DecodeInvoiceResponse,
    FeeEstimateResponse,
    ReceiveInvoiceResponse,
    SendPaymentResponse,
    TransactionDetails,
    TransactionHistoryResponse,
    TransactionSource,
} from "./wallet.ts";

// Community wallets mirror the personal and event wallets (same request and
// response shapes) under `/secure/communities/{communityId}/wallet/*`. Every
// route is owner-only: the community owner or a platform admin. Community
// admins get a 403. The wallet itself is fetched (and created on first use) with
// `getCommunityWallet` in `api/community.ts`.

/**
 * History filter. Unlike the personal and event wallets ("send" / "receive"),
 * the community endpoint names directions "sent" / "received" and can also
 * filter by status.
 */
export type CommunityWalletFilter = "all" | "sent" | "received" | "pending" | "completed" | "failed";

const getHeaders = (getJwt: func_GetJwt) => {
    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }
    return headers;
};

/** Wallets of every community the user owns (all of them, for platform admins). */
export const getCommunityWallets =
    (urlArg: URL, getJwt: func_GetJwt) => async (): Promise<CommunityWalletInfo[] | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/secure/me/community-wallets`;
        const response = await safeFetch(url, {
            method: "GET",
            headers: getHeaders(getJwt),
        });
        return response instanceof Error ? response : handleResponse<CommunityWalletInfo[]>(response);
    };

export const createCommunityReceiveInvoice = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    communityId: number,
    amount: number,
    memo?: string,
): Promise<ReceiveInvoiceResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${communityId}/wallet/receive`;
    const response = await safeFetch(url, {
        method: "POST",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ amount, memo }),
    });
    return response instanceof Error ? response : handleResponse<ReceiveInvoiceResponse>(response);
};

export const sendCommunityPayment = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    communityId: number,
    destination: string,
    amount: number,
    memo?: string,
): Promise<SendPaymentResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${communityId}/wallet/send`;
    const response = await safeFetch(url, {
        method: "POST",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ destination, amount, memo }),
    });
    return response instanceof Error ? response : handleResponse<SendPaymentResponse>(response);
};

export const estimateCommunityPaymentFee = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    communityId: number,
    destination: string,
    amount: number,
): Promise<FeeEstimateResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${communityId}/wallet/send/estimate-fee`;
    const response = await safeFetch(url, {
        method: "POST",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ destination, amount }),
    });
    return response instanceof Error ? response : handleResponse<FeeEstimateResponse>(response);
};

export const getCommunityTransactionHistory = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    communityId: number,
    page = 1,
    limit = 20,
    filter: CommunityWalletFilter = "all",
): Promise<TransactionHistoryResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${communityId}/wallet/transactions`;
    url.searchParams.set("page", page.toString());
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("filter", filter);
    const response = await safeFetch(url, {
        method: "GET",
        headers: getHeaders(getJwt),
    });
    return response instanceof Error ? response : handleResponse<TransactionHistoryResponse>(response);
};

/**
 * Community-wallet histories interleave wallet transactions with membership
 * payments, withdrawals and refunds, whose `id` comes from another table. Pass
 * the row's `source` so the backend resolves the id in the right one.
 */
export const getCommunityTransactionDetails = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    communityId: number,
    txId: number,
    source?: TransactionSource,
): Promise<TransactionDetails | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${communityId}/wallet/transactions/${txId}`;
    if (source && source !== "wallet") {
        url.searchParams.set("source", source);
    }
    const response = await safeFetch(url, {
        method: "GET",
        headers: getHeaders(getJwt),
    });
    return response instanceof Error ? response : handleResponse<TransactionDetails>(response);
};

export const decodeCommunityInvoice = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    communityId: number,
    invoice: string,
): Promise<DecodeInvoiceResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${communityId}/wallet/decode`;
    const response = await safeFetch(url, {
        method: "POST",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ invoice }),
    });
    return response instanceof Error ? response : handleResponse<DecodeInvoiceResponse>(response);
};

/**
 * Sets the local part of the community wallet's `@satlantis.io` address. The
 * server lowercases it and strips non-alphanumerics (max 32 characters); 409
 * when the name is taken.
 */
export const updateCommunityWalletLightningAddress = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    communityId: number,
    lightningAddress: string,
): Promise<CommunityWalletInfo | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/communities/${communityId}/wallet/lightning-address`;
    const response = await safeFetch(url, {
        method: "PUT",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ lightningAddress }),
    });
    return response instanceof Error ? response : handleResponse<CommunityWalletInfo>(response);
};
