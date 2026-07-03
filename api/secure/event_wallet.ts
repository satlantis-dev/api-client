import type { func_GetJwt } from "../../sdk";
import { copyURL, handleResponse } from "../../helpers/_helper";
import { safeFetch } from "../../helpers/safe-fetch";
import type {
    DecodeInvoiceResponse,
    FeeEstimateResponse,
    ReceiveInvoiceResponse,
    Recipient,
    SendPaymentResponse,
    TransactionDetails,
    TransactionHistoryResponse,
    WalletFilter,
} from "./wallet";

// --- Response Interfaces ---

/**
 * A calendar event's Lightning wallet. Mirrors the main wallet's `GetWalletResponse`
 * except the identity field is `calendarEventId` (not `accountId`) and the response
 * inlines `eventTitle` / `eventImage` for display. `balanceUsd` and `lightningAddress`
 * are nullable server-side (`*float64` / `*string`) — the rate fetch or the auto-derived
 * address can be absent.
 */
export interface EventWalletInfoResponse {
    id: number;
    calendarEventId: number;
    eventTitle: string;
    eventImage: string;
    balance: number; // SATS
    balanceUsd: number | null;
    lightningAddress: string | null;
    currency: string;
    createdAt: string;
}

// --- API Implementation ---

const getHeaders = (getJwt: func_GetJwt) => {
    const jwtToken = getJwt();
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (jwtToken) {
        headers.set("Authorization", `Bearer ${jwtToken}`);
    }
    return headers;
};

export const getEventWallets =
    (urlArg: URL, getJwt: func_GetJwt) => async (): Promise<EventWalletInfoResponse[] | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/secure/me/event-wallets`;
        const response = await safeFetch(url, {
            method: "GET",
            headers: getHeaders(getJwt),
        });
        return response instanceof Error ? response : handleResponse<EventWalletInfoResponse[]>(response);
    };

export const getEventWallet =
    (urlArg: URL, getJwt: func_GetJwt) =>
    async (eventId: number): Promise<EventWalletInfoResponse | null | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/secure/events/${eventId}/wallet`;
        const response = await safeFetch(url, {
            method: "GET",
            headers: getHeaders(getJwt),
        });
        return response instanceof Error ? response : handleResponse<EventWalletInfoResponse>(response);
    };

export const createEventReceiveInvoice = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
    amount: number,
    memo?: string,
): Promise<ReceiveInvoiceResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${eventId}/wallet/receive`;
    const response = await safeFetch(url, {
        method: "POST",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ amount, memo }),
    });
    return response instanceof Error ? response : handleResponse<ReceiveInvoiceResponse>(response);
};

export const sendEventPayment = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
    destination: string,
    amount: number,
    memo?: string,
): Promise<SendPaymentResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${eventId}/wallet/send`;
    const response = await safeFetch(url, {
        method: "POST",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ destination, amount, memo }),
    });
    return response instanceof Error ? response : handleResponse<SendPaymentResponse>(response);
};

export type BulkSendResultStatus = "completed" | "pending" | "failed" | "already_paid";

export interface BulkSendResult {
    accountId: number;
    success: boolean;
    status: BulkSendResultStatus;
    transactionId?: number;
    recipient?: Recipient;
    paymentHash?: string;
    failureReason?: string;
}

export interface BulkSendPaymentResponse {
    totalRecipients: number;
    totalSucceeded: number;
    totalFailed: number;
    amountPerRecipient: number;
    totalAmount: number;
    totalFee: number;
    results: BulkSendResult[];
}

/**
 * Sends a uniform `amount` of sats from the event's wallet to every account in
 * `accountIds`. Returns HTTP 200 with one `BulkSendResult` per recipient even on
 * partial failure — only batch-level problems (malformed body, >50 recipients,
 * missing wallet) come back as an Error. `already_paid` results count as
 * successes: key success off `result.success`, not `status`. `recipient` is
 * absent when the account wasn't found.
 *
 * The server rejects more than 50 recipients per request — chunk larger
 * selections into sequential calls that REUSE the same `idempotencyKey` (max 64
 * chars). The server keeps a per-key ledger and records recipients before
 * paying, so retries with the same key can never double-pay.
 */
export const bulkSendEventPayment = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
    accountIds: number[],
    amount: number,
    idempotencyKey: string,
    memo?: string,
): Promise<BulkSendPaymentResponse | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${eventId}/wallet/bulk-send`;
    const response = await safeFetch(url, {
        method: "POST",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ accountIds, amount, memo, idempotencyKey }),
    });
    return response instanceof Error ? response : handleResponse<BulkSendPaymentResponse>(response);
};

export const estimateEventPaymentFee = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
    destination: string,
    amount: number,
): Promise<FeeEstimateResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${eventId}/wallet/send/estimate-fee`;
    const response = await safeFetch(url, {
        method: "POST",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ destination, amount }),
    });
    return response instanceof Error ? response : handleResponse<FeeEstimateResponse>(response);
};

export const getEventTransactionHistory = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
    page = 1,
    limit = 20,
    filter: WalletFilter = "all",
): Promise<TransactionHistoryResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${eventId}/wallet/transactions`;
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
 * Event-wallet histories interleave regular wallet transactions with ticket
 * purchases (`source: "ticket"`), whose `id` is a ticket ORDER id from a
 * different table. Pass `isPurchase: true` for those rows so the backend
 * resolves the id against ticket orders instead of wallet transactions.
 */
export const getEventTransactionDetails = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
    txId: number,
    isPurchase = false,
): Promise<TransactionDetails | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${eventId}/wallet/transactions/${txId}`;
    if (isPurchase) {
        url.searchParams.set("is_purchase", "true");
    }
    const response = await safeFetch(url, {
        method: "GET",
        headers: getHeaders(getJwt),
    });
    return response instanceof Error ? response : handleResponse<TransactionDetails>(response);
};

export const decodeEventInvoice = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
    invoice: string,
): Promise<DecodeInvoiceResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${eventId}/wallet/decode`;
    const response = await safeFetch(url, {
        method: "POST",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ invoice }),
    });
    return response instanceof Error ? response : handleResponse<DecodeInvoiceResponse>(response);
};

export const updateEventWalletLightningAddress = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    eventId: number,
    lightningAddress: string,
): Promise<EventWalletInfoResponse | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/events/${eventId}/wallet/lightning-address`;
    const response = await safeFetch(url, {
        method: "PUT",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ lightningAddress }),
    });
    return response instanceof Error ? response : handleResponse<EventWalletInfoResponse>(response);
};
