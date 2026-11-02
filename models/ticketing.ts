import type { CalendarEvent, CalendarEventRSVP } from "@satlantis/api-client";
import type { EventTicketStatus, EventTicketType } from "../api/events.ts";
import type { OrderStatus, PaymentMethod, PaymentStatus, RefundStatus } from "./order.ts";

export enum OrderCurrency {
    BTC = "BTC",
    USD = "USD",
    EUR = "EUR",
    CAD = "CAD",
    GBP = "GBP",
    AUD = "AUD",
    NZD = "NZD",
    PYG = "PYG", // zero-decimal: amounts are whole guaraníes
}

/**
 * Fiat currencies with no minor unit: the API stores and charges them in whole units
 * (PYG 50000 is ₲50,000) instead of hundredths. Mirrors util.CurrencyMinorUnits in the api,
 * so keep the two in sync when a currency is added.
 */
export const ZERO_DECIMAL_CURRENCIES: readonly string[] = ["JPY", "KRW", "VND", OrderCurrency.PYG];

/**
 * How many API units make one unit of a fiat currency: 1 for a zero-decimal currency, 100
 * (cents) for any other. Case-insensitive; a null/unset currency counts as USD. Not for BTC,
 * whose amounts are sats.
 */
export function currencyMinorUnits(currency: string | null | undefined): number {
    return currency && ZERO_DECIMAL_CURRENCIES.includes(currency.toUpperCase()) ? 1 : 100;
}

export enum CouponDiscountType {
    Percent = "percentage",
    Amount = "fixed_amount",
}

export enum CouponScope {
    Event = "event",
    Calendar = "calendar",
}

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
    ticketType: EventTicketType;
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

export type CreateCouponPayload = {
    calendarEventId?: number;
    calendarId?: number;
    code: string;
    description?: string | null;
    discountAmount?: number | null;
    discountCurrency?: string | null;
    discountPercent?: number | null;
    discountType: CouponDiscountType;
    endsAt?: string | null;
    isActive?: boolean;
    isSingleUse?: boolean;
    maxRedemptions?: number | null;
    scope: CouponScope;
    startsAt?: string | null;
    ticketTypeIds?: number[] | null;
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

export type GetEventCouponsResponse = {
    active: CalendarEventCoupon[];
    inactive: CalendarEventCoupon[];
    deleted: CalendarEventCoupon[];
};

export type CouponPreviewOrder = {
    paymentCurrency: string;
    payWhatYouWantAmount?: number | null;
    priceFiat?: number | null;
    priceSats?: number | null;
    quantity: number;
    ticketTypeId: number;
};

export type CouponPreviewPayload = {
    couponCode: string;
    ticketTypeOrders: CouponPreviewOrder[];
    email?: string | null;
};

export type CouponPreviewResponse = {
    couponCode: string;
    currency: string;
    discountType: string;
    error?: string;
    errorCode?: string;
    finalTotal: number;
    originalTotal: number;
    promotionDiscount?: number;
    perItemDiscounts: {
        discount: number;
        discountPercent: number;
        discountedQty: number;
        ticketTypeId: number;
    }[];
    totalDiscount: number;
    valid: boolean;
};
