import type { CalendarEvent, CalendarEventRSVP } from "@satlantis/api-client";
import type { OrderStatus, PaymentMethod, PaymentStatus, RefundStatus } from "./order.ts";
import type { EventDetails, EventTicketStatus } from "../api/events.ts";

export enum OrderCurrency {
    BTC = "BTC",
    USD = "USD",
    EUR = "EUR",
    CAD = "CAD",
    GBP = "GBP",
    AUD = "AUD",
}

export enum CouponDiscountType {
    Percent = "percentage",
    Amount = "fixed_amount",
}

export enum CouponScope {
    Event = "event",
    Calendar = "calendar",
}

export type CalendarEventTicketType = {
    id: number;
    calendarEventId: number;
    name: string;
    description?: string;
    priceSats?: number;
    priceFiat?: number;
    fiatCurrency?: OrderCurrency;
    priceCurrency?: OrderCurrency;
    sellCurrencies: Record<string, unknown>;
    priceAmount?: number;
    priceAmountForBTC?: number;
    maxCapacity?: number;
    sellStartDate?: string;
    sellEndDate?: string;
    createdAt: string;
    isHidden: boolean;
};

export type CalendarEventTicketOrder = {
    id: number;
    calendarEventId: number;
    calendarEvent: CalendarEvent;
    items: CalendarEventTicketOrderItem[];
    accountId: number;
    totalPrice: number;
    currency: OrderCurrency;
    refundedAmount: number;
    priceCurrency?: OrderCurrency;
    priceAmount?: number;
    status: OrderStatus;
    rsvpData?: Record<string, unknown>;
};

export type CalendarEventTicketOrderItem = {
    id: number;
    orderId: number;
    order: CalendarEventTicketOrder;
    ticketTypeId: number;
    ticketType: CalendarEventTicketType;
    quantity: number;
    priceEach: number;
    currency: OrderCurrency;
    refundedAmount: number;
    priceCurrency?: OrderCurrency;
    priceAmount?: number;
    status: OrderStatus;
};

export type CalendarEventTicket = {
    id: number;
    orderItemId: number;
    orderItem: CalendarEventTicketOrderItem;
    accountId: number;
    rsvpId?: number;
    rsvp?: CalendarEventRSVP;
    status: EventTicketStatus;
    code: string;
    checkedInAt?: string;
};

export type CalendarEventTicketOrderPayment = {
    id: number;
    orderId: number;
    order: CalendarEventTicketOrder;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    currency: OrderCurrency;
    exchangeRate?: number;
    exchangeRateSource?: string;
    lightningPaymentHash?: string;
    lightningPaymentRequest?: string;
    lightningPreimage?: string;
    lightningProvider?: string;
    lightningProviderTxId?: string;
    paymentProviderReference?: string;
    metadata?: Record<string, unknown>;
    paidAt?: string;
    expiredAt?: string;
    expiresAt?: string;
    failedAt?: string;
    refundedAt?: string;
    cancelledAt?: string;
    createdAt: string;
    updatedAt: string;
};

export type CalendarEventTicketOrderRefund = {
    id: number;
    orderId: number;
    amount: number;
    fee: number;
    currency: string;
    status: RefundStatus;
    refundMethod: string;
    lightningAddress?: string;
    lightningPaymentHash?: string;
    lightningPreimage?: string;
    stripeRefundId?: string;
    stripePaymentIntentId?: string;
    reason?: string;
    createdAt: string;
    processedAt?: string;
    failedAt?: string;
    failureReason?: string;
    metadata?: Record<string, unknown>;
};

export type CalendarEventCoupon = {
    id: number;
    scope: CouponScope;
    calendarEventId?: number;
    calendarId?: number;
    ticketTypeIds?: number[];
    code: string;
    description?: string;
    discountType: CouponDiscountType;
    discountPercentage?: number;
    discountAmount?: number;
    discountCurrency?: OrderCurrency;
    maxRedemptions?: number;
    redemptions: number;
    startsAt: string;
    endsAt: string;
    isSingleUse: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};
