import type { EventTicketType, RsvpStatus } from "../api/events.ts";
import type { OrderStatus, PaymentMethod, PaymentStatus, RefundStatus } from "./order.ts";

export type EventOrderItemHistory = {
    id: number;
    ticketTypeId: number;
    ticketType: EventTicketType & { calendarEventId: number };
    quantity: number;
    priceEach: number;
    currency: string; // "BTC"
    status: OrderStatus; // "pending", "paid", "expired", "failed"
};

export type EventPaymentHistory = {
    id: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    lightningInvoice?: string;
    lightningPaymentHash?: string;
    lightningPreimage?: string;
    stripePaymentIntentId?: string;
    createdAt: string;
    paidAt?: string;
    expiredAt?: string;
    failedAt?: string;
};

export type EventRefundHistory = {
    id: number;
    amount: number;
    status: RefundStatus;
    refundMethod: "lightning" | "stripe";
    lightningAddress?: string;
    lightningPreimage?: string;
    lightningPaymentHash?: string;
    stripeRefundId?: string;
    stripePaymentIntentId?: string;
    reason?: string;
    requestedAt: string;
    processedAt?: string;
    failedAt?: string;
    failureReason?: string;
};

export type EventOrderPaymentHistory = {
    orderId: number;
    calendarEventId: number;
    accountId: number;
    totalPrice: number;
    currency: string; // "BTC"
    orderStatus: string; // "pending", "paid", "expired", "failed"
    createdAt: string;
    orderItems: EventOrderItemHistory[];
    payment?: EventPaymentHistory;
    refunds: EventRefundHistory[];
    totalRefunded: number;
    netAmount: number;
    lightningAddress?: string;
};

export type EventUserTimeline = {
    eventId: number;
    accountId: number;
    rsvpId?: number;
    rsvpStatus?: RsvpStatus;
    orders: EventOrderPaymentHistory[];
    totalSpent: number;
    totalRefunded: number;
    netSpent: number;
    currency: string; // "BTC"
    lightningAddress?: string; // Refunding lightning address entered when purchasing a ticket.
};

export type CalendarEventTag = {
    id: number;
    name: string;
    numEvents: number;
}

