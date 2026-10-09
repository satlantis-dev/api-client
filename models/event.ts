import type { EventTicketType, RsvpStatus } from "../api/events.ts";
import type { OrderStatus, PaymentMethod, PaymentStatus, RefundStatus } from "./order.ts";

export type EventOrderItemHistory = {
    id: number;
    ticketTypeId: number;
    ticketType: EventTicketType & { calendarEventId: number };
    quantity: number;
    priceEach: number;
    payWhatYouWantAmount?: number | null;
    currency: string; // "BTC"
    status: OrderStatus; // "pending", "paid", "expired", "failed"
    promotionName?: string;
    discountPercent?: number;
    originalPrice?: number;
    couponId?: number;
    couponCode?: string;
    couponDiscountAmount?: number;
    couponDiscountPercent?: number;
};

// Fee accounting for one paid transaction, in the same units as the payment it belongs to:
// minor units (cents) for fiat, sats for BTC.
//
// `platformFeeAmount` is what Satlantis charged and `processorFeeAmount` is what the payment
// processor charged; the two are always reported separately. `processorFeeAmount` is absent on
// BTC rather than zero, because Lightning routing and on-chain miner fees on an inbound payment
// are paid by the sender — the organizer is charged nothing, so there is no figure to report.
//
// Recorded once per PAYMENT, so it covers the whole order: there is no per-order-item figure.
export type PaymentFeeBreakdown = {
    grossAmount: number;
    platformFeeAmount: number;
    // The rate behind `platformFeeAmount`, as a percentage (2.9 for Starter's 2.9%).
    // Plan-dependent — Growth and Pro are 0% — so the UI cannot assume a rate.
    platformFeePercent: number;
    // Absent on the BTC rail. See the note above.
    processorFeeAmount?: number;
    netAmount: number;
    currency: string; // "USD", "BTC", ...
    paymentRail: PaymentMethod;
    planTier?: string;
    // Which rule produced the rate: "plan" | "override" | "config" | "backfill".
    // "backfill" marks a breakdown reconstructed after the fact rather than recorded at settlement.
    feeSource: string;
};

export type EventPaymentHistory = {
    id: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    // Absent on orders that predate fee tracking, so every read must tolerate it missing.
    platformFee?: PaymentFeeBreakdown;
    // Stripe payment
    cardLast4?: string;
    cardBrand?: string;
    receiptUrl?: string;
    paymentMethodId?: string;
    //Lightning payment
    lightningInvoice?: string;
    lightningPaymentHash?: string;
    lightningPreimage?: string;
    // On-chain payment
    onchainAddress?: string;
    onchainTxId?: string;
    onchainConfirmations?: number;
    onchainReceivedSats?: number;
    stripePaymentIntentId?: string;
    stripeTransactionId?: string;
    createdAt: string;
    paidAt?: string;
    expiredAt?: string;
    failedAt?: string;
};

export type EventRefundHistory = {
    id: number;
    amount: number;
    status: RefundStatus;
    refundMethod: "lightning" | "stripe" | "satlantis_wallet";
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

export type GuestTimelineEntryType =
    | "rsvp_status_change"
    | "payment_inbound"
    | "payment_outbound"
    | "ticket_added"
    | "ticket_removed"
    | "communication"
    | "check_in";

export type RSVPStatusChangeData = {
    status: RsvpStatus;
};

export type PaymentInboundData = {
    orderId: number;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod | "lightning";
    status?: PaymentStatus;
    ticketTypeName?: string;
    lightningInvoice?: string;
    lightningPaymentHash?: string;
    lightningPreimage?: string;
    onchainAddress?: string;
    onchainTxId?: string;
    onchainConfirmations?: number;
    onchainReceivedSats?: number;
    cardBrand?: string;
    cardLast4?: string;
};

export type PaymentOutboundData = {
    orderId: number;
    refundId: number;
    amount: number;
    fee?: number;
    currency: string;
    status?: RefundStatus;
    refundMethod: "lightning" | "stripe" | "satlantis_wallet";
    lightningAddress?: string;
    lightningPaymentHash?: string;
    lightningPreimage?: string;
    stripeRefundId?: string;
};

export type TicketAddedData = {
    ticketId: number;
    ticketCode: string;
    ticketTypeId: number;
    ticketTypeName: string;
    orderId?: number;
};

export type TicketRemovedData = {
    ticketId: number;
    ticketCode: string;
    ticketTypeId: number;
    ticketTypeName: string;
    reason?: string;
};

export type CommunicationData = {
    channels?: string[];
    emailSubject?: string;
};

export type CheckInData = {
    ticketId: number;
    ticketCode: string;
    ticketTypeName: string;
};

export type TimelineData = {
    rsvpStatusChange?: RSVPStatusChangeData;
    paymentInbound?: PaymentInboundData;
    paymentOutbound?: PaymentOutboundData;
    ticketAdded?: TicketAddedData;
    ticketRemoved?: TicketRemovedData;
    communication?: CommunicationData;
    checkIn?: CheckInData;
};

export type GuestTimelineEntry = {
    type: GuestTimelineEntryType;
    timestamp: string;
    data: TimelineData;
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
    timeline?: GuestTimelineEntry[];
};

export type GoogleWalletData = {
    saveUrl: string;
    jwt: string;
};

export type CalendarEventTag = {
    id: number;
    name: string;
    numEvents: number;
};

export type AccountEventTicket = {
    id: number;
    ticketCode: string;
    ticketName: string;
    eventTitle: string;
    eventLocation: string;
    eventStart: string;
    ticketHolder: string;
    checkedInAt: string | null;
    status: string;
    eventId: number;
    eventImage: string;
    place?: {
        id: number;
        name: string;
        countryName?: string;
    };
};
