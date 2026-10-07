export enum PaymentMethod {
    LIGHTNING = "lightning",
    ONCHAIN = "onchain",
    STRIPE = "stripe",
    // Collected outside the platform; see OfflinePaymentMethod for how.
    OFFLINE = "offline",
}

// How an off-platform (offline) payment was actually made. Mirrors the backend's
// models.OfflinePaymentMethod; the backend defaults to OTHER when omitted.
export enum OfflinePaymentMethod {
    CASH = "cash",
    CARD = "card",
    TRANSFER = "transfer",
    CHEQUE = "cheque",
    CRYPTO = "crypto",
    PIX = "pix",
    ALIPAY = "alipay",
    REVOLUT = "revolut",
    WECHAT = "wechat",
    WISE = "wise",
    ZELLE = "zelle",
    OTHER = "other",
}

export enum OrderStatus {
    PENDING = "pending",
    PAID = "paid",
    CANCELLED = "cancelled",
    REFUNDED = "refunded",
}

export enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    EXPIRED = "expired",
    FAILED = "failed",
    REFUNDED = "refunded",
    CANCELLED = "cancelled",
}

export enum RefundStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
}

export type RefundOrderResponse = {
    id: number;
    orderId: number;
    amount: number;
    currency: string;
    status: RefundStatus; // most likely "pending"
    refundMethod: PaymentMethod;
    lightningAddress?: string;
    lightningPaymentHash?: string;
    stripeRefundId?: string;
    stripePaymentIntentId?: string;
    reason?: string;
    requestedAt: string;
    processedAt?: string;
    failedAt?: string;
    failureReason?: string;
};
