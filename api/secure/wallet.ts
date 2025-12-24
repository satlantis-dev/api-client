import type { func_GetJwt } from "../../sdk";
import { copyURL, handleResponse } from "../../helpers/_helper";
import { safeFetch } from "../../helpers/safe-fetch";

// --- Enums ---

export type TransactionStatus =
    | "pending"
    | "completed"
    | "failed"
    | "cancelled";
export type TransactionType = "send" | "receive";
export type WalletFilter = "all" | "send" | "receive";

// --- Shared Interfaces ---

export interface Recipient {
    accountId: number;
    username: string;
    displayName: string;
    picture: string;
    npub: string;
    lightningAddress: string;
    identifier: string;
}

// --- Response Interfaces ---

export interface GetWalletResponse {
    id: number;
    accountId: number;
    balance: number; // SATS
    balanceUsd: number;
    lightningAddress: string;
    currency: string;
    createdAt: string;
}

export interface ReceiveInvoiceResponse {
    transactionId: number;
    invoice: string;
    lightningAddress: string;
    paymentHash: string;
    amount: number;
    expiresAt: string;
    memo: string;
}

export interface SendPaymentResponse {
    transactionId: number;
    status: TransactionStatus;
    amount: number;
    fee: number;
    total: number;
    recipient: Recipient;
    paymentHash: string;
    message: string;
}

export interface FeeEstimateResponse {
    fee: number;
    amount: number;
    total: number;
    destination: string;
    recipient: Recipient;
}

export interface Transaction {
    id: number;
    type: TransactionType;
    fromAmount: number;
    fromCurrency: string;
    toAmount: number;
    toCurrency: string;
    fee: number;
    feeCurrency: string;
    fromAmountUsd: number;
    toAmountUsd: number;
    recipient: Recipient | null;
    sender: Recipient | null;
    memo: string;
    status: TransactionStatus;
    timestamp: string;
}

export interface TransactionDetails extends Transaction {
    feeUsd: number;
    exchangeRate: number;
    exchangeRateUsd: number;
    lightningInvoice: string;
    paymentHash: string;
    preimage: string;
    providerName: string;
    createdAt: string;
    completedAt: string | null;
    failedAt: string | null;
}

export interface TransactionHistoryResponse {
    transactions: Transaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    stats: {
        totalSent: number;
        totalReceived: number;
        sendCount: number;
        receiveCount: number;
        pendingCount: number;
    };
}

export interface DecodeInvoiceResponse {
    invoice: string;
    paymentHash: string;
    amountSats: number;
    amountMsat: number;
    description: string;
    expiry: number;
    timestamp: number;
    expiresAt: string;
    payee: string;
}

export interface ExchangeRateResponse {
    btcToUsd: number;
    satsToUsd: number;
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

export const getWallet =
    (urlArg: URL, getJwt: func_GetJwt) => async (): Promise<GetWalletResponse | null | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/secure/wallet`;
        const response = await safeFetch(url, {
            method: "GET",
            headers: getHeaders(getJwt),
        });
        return response instanceof Error ? response : handleResponse<GetWalletResponse>(response);
    };

export const createReceiveInvoice = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    amount: number,
    memo?: string,
): Promise<ReceiveInvoiceResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/wallet/receive`;
    const response = await safeFetch(url, {
        method: "POST",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ amount, memo }),
    });
    return response instanceof Error ? response : handleResponse<ReceiveInvoiceResponse>(response);
};

export const sendPayment = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    destination: string,
    amount: number,
    memo?: string,
): Promise<SendPaymentResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/wallet/send`;
    const response = await safeFetch(url, {
        method: "POST",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ destination, amount, memo }),
    });
    return response instanceof Error ? response : handleResponse<SendPaymentResponse>(response);
};

export const estimatePaymentFee = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    destination: string,
    amount: number,
): Promise<FeeEstimateResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/wallet/send/estimate-fee`;
    const response = await safeFetch(url, {
        method: "POST",
        headers: getHeaders(getJwt),
        body: JSON.stringify({ destination, amount }),
    });
    return response instanceof Error ? response : handleResponse<FeeEstimateResponse>(response);
};

export const getTransactionHistory = (urlArg: URL, getJwt: func_GetJwt) =>
async (
    page = 1,
    limit = 20,
    filter: WalletFilter = "all",
): Promise<TransactionHistoryResponse | null | Error> => {
    const url = copyURL(urlArg);
    url.pathname = `/secure/wallet/transactions`;
    url.searchParams.set("page", page.toString());
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("filter", filter);
    const response = await safeFetch(url, {
        method: "GET",
        headers: getHeaders(getJwt),
    });
    return response instanceof Error ? response : handleResponse<TransactionHistoryResponse>(response);
};

export const getTransactionDetails =
    (urlArg: URL, getJwt: func_GetJwt) => async (id: number): Promise<TransactionDetails | null | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/secure/wallet/transactions/${id}`;
        const response = await safeFetch(url, {
            method: "GET",
            headers: getHeaders(getJwt),
        });
        return response instanceof Error ? response : handleResponse<TransactionDetails>(response);
    };

export const decodeInvoice =
    (urlArg: URL, getJwt: func_GetJwt) =>
    async (invoice: string): Promise<DecodeInvoiceResponse | null | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/secure/wallet/decode`;
        const response = await safeFetch(url, {
            method: "POST",
            headers: getHeaders(getJwt),
            body: JSON.stringify({ invoice }),
        });
        return response instanceof Error ? response : handleResponse<DecodeInvoiceResponse>(response);
    };

export const getWalletExchangeRate =
    (urlArg: URL, getJwt: func_GetJwt) => async (): Promise<ExchangeRateResponse | null | Error> => {
        const url = copyURL(urlArg);
        url.pathname = `/secure/wallet/rate`;
        const response = await safeFetch(url, {
            method: "GET",
            headers: getHeaders(getJwt),
        });
        return response instanceof Error ? response : handleResponse<ExchangeRateResponse>(response);
    };
