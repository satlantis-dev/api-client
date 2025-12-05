export enum PaymentMethod {
    LIGHTNING = "lightning",
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
