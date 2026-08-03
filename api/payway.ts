import { safeFetch } from "../helpers/safe-fetch.ts";
import { createPublicUrl, createSecureUrl, handleResponse } from "../helpers/util.ts";
import type { func_GetJwt } from "../sdk.ts";
import type { EventTicketPurchaseResponse } from "./events.ts";

/**
 * PayWay 3DS card payments for ticket orders.
 *
 * The flow is three server calls around two browser-side 3DS stages:
 *
 *   step1    -> submit card + billing data, receive the device-data-collection
 *               (DDC) iframe parameters (`step: "2"`).
 *   step3    -> after DDC, complete the financial operation. Resolves to
 *               `paid`/`failed`, or hands back OTP iframe parameters
 *               (`step: "4"`), or reports `pending` on a gateway timeout.
 *   finalize -> verify the final state server-side via PayWay's trace API.
 *               Idempotent, and doubles as recovery when the client was lost
 *               mid-flow, so it is safe (and expected) to re-call.
 *
 * step1/step3/finalize are public: the `paymentId` order code is the capability.
 * Only `voidPaywayOrder` is JWT-guarded, and is restricted to event organizers.
 */

/**
 * Card and 3DS billing data for step 1.
 *
 * The card number and CVV must never be logged or persisted anywhere — the
 * backend documents the same constraint on its own struct.
 *
 * Length limits mirror the Go `binding` tags; the server rejects violations
 * before contacting PayWay, so validate client-side to save a round trip.
 */
export type PaywayCardInput = {
    cardNumber: string;
    cvv: string;
    /** Accepts `YYYYMM`, `MM/YY`, `MM/YYYY` or `MMYY`. */
    expiry: string;
    email: string;
    /** Max 60 characters. */
    firstName: string;
    /** Max 60 characters. */
    lastName: string;
    /** Max 60 characters. */
    address: string;
    /** Max 20 characters. */
    phone: string;
    /** ISO 3166-1 alpha-2, exactly 2 characters. */
    countryIso: string;
    /** Max 10 characters. Required by PayWay for US/CA/CN billing addresses. */
    postalCode?: string;
    /**
     * Honored only when the transport-level IP is loopback/private, i.e. local
     * testing — behind the production proxy the transport IP wins. Real clients
     * should leave this unset rather than pay for an IP-lookup round trip.
     */
    clientIp?: string;
};

/**
 * - `challenge` — a 3DS stage is required; see `step`, `challengeUrl`, `tokenAcceso`.
 * - `paid` / `failed` — terminal, and `payment` carries the settled order.
 * - `pending` — PayWay timed out; call `finalizePaywayPayment` to resolve it.
 */
export type PaywayStepStatus = "challenge" | "paid" | "failed" | "pending";

/** `"2"` is the hidden device-data collection stage, `"4"` the visible OTP. */
export type PaywayStep = "2" | "4";

/**
 * The wire shape of `services.PaywayStepResult`. Kept private so the Spanish
 * field names stay in one auditable place; consumers get {@link PaywayStepResult}.
 */
type PaywayStepResultDTO = {
    status?: PaywayStepStatus;
    step?: PaywayStep;
    message?: string;
    numeroPayWay?: string;
    tokenAcceso?: string;
    /** Carries the OTP URL too when `step` is `"4"`, despite the name. */
    urlColeccionDatoDispositivo?: string;
    payment?: EventTicketPurchaseResponse;
};

export type PaywayStepResult = {
    status?: PaywayStepStatus;
    step?: PaywayStep;
    /**
     * On failure this is PayWay's own message. Denials are deliberately
     * collapsed to `"Transaction denied"` server-side — the issuer's reason is
     * not leaked — so it is not safe to branch on beyond that.
     */
    message?: string;
    /** PayWay's transaction number. Useful for support, opaque to us. */
    numeroPayWay?: string;
    /** Posted to {@link challengeUrl} as the `JWT` form field. */
    tokenAcceso?: string;
    /**
     * The URL to load for the current 3DS stage: device-data collection when
     * `step` is `"2"`, the OTP challenge when it is `"4"`. The wire field is
     * `urlColeccionDatoDispositivo` in both cases; renamed here because that
     * name is wrong half the time.
     */
    challengeUrl?: string;
    /** The settled order, present once `status` is `paid` or `failed`. */
    payment?: EventTicketPurchaseResponse;
};

const toPaywayStepResult = (dto: PaywayStepResultDTO): PaywayStepResult => {
    const { urlColeccionDatoDispositivo, ...rest } = dto;

    return { ...rest, challengeUrl: urlColeccionDatoDispositivo };
};

/**
 * `services.PaywaySeguimiento3DS`, transcribed verbatim. This is a diagnostic
 * echo of PayWay's own trace record rather than something a client acts on, so
 * unlike {@link PaywayStepResult} its field names are left alone.
 */
export type PaywaySeguimiento3DS = {
    numeroTransaccionReferencia?: string;
    numeroTransaccionSistema?: string;
    paso?: string;
    referenciaId?: string;
    tokenAcceso?: string;
    urlColeccionDatoDispositivo?: string;
};

/** PayWay's raw response to a void, surfaced as-is. */
export type PaywayResponse = {
    success?: boolean;
    message?: string;
    returnCode?: string;
    codigoRetorno2?: string;
    mensajeRetorno2?: string;
    fechaTransaccion?: string;
    numeroAutorizacion?: string;
    numeroCompra?: string;
    numeroPayWay?: string;
    numeroReferencia?: string;
    numeroUuid?: string;
    marcaTarjeta?: string;
    terminacionTarjeta?: string;
    titularTarjeta?: string;
    traceId?: string;
    seguimientoDatos3ds?: PaywaySeguimiento3DS;
};

export type PaywayStep1Args = {
    /** The order code from `POST /events/{id}/order`, not a numeric id. */
    paymentId: string;
    card: PaywayCardInput;
};

export function paywayStep1(urlArg: URL) {
    return async (args: PaywayStep1Args): Promise<PaywayStepResult | Error> => {
        const url = createPublicUrl(urlArg, `/payments/${args.paymentId}/payway/step1`);

        const response = await safeFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(args.card),
        });

        if (response instanceof Error) return response;

        const result = await handleResponse<PaywayStepResultDTO>(response);

        if (result instanceof Error) return result;

        return toPaywayStepResult(result);
    };
}

export type PaywayPaymentArgs = {
    /** The order code from `POST /events/{id}/order`, not a numeric id. */
    paymentId: string;
};

export function paywayStep3(urlArg: URL) {
    return async (args: PaywayPaymentArgs): Promise<PaywayStepResult | Error> => {
        const url = createPublicUrl(urlArg, `/payments/${args.paymentId}/payway/step3`);

        const response = await safeFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response instanceof Error) return response;

        const result = await handleResponse<PaywayStepResultDTO>(response);

        if (result instanceof Error) return result;

        return toPaywayStepResult(result);
    };
}

export function paywayFinalize(urlArg: URL) {
    return async (args: PaywayPaymentArgs): Promise<PaywayStepResult | Error> => {
        const url = createPublicUrl(urlArg, `/payments/${args.paymentId}/payway/finalize`);

        const response = await safeFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response instanceof Error) return response;

        const result = await handleResponse<PaywayStepResultDTO>(response);

        if (result instanceof Error) return result;

        return toPaywayStepResult(result);
    };
}

export type PaywayVoidOrderArgs = {
    orderId: number;
};

/**
 * Organizer-only. PayWay allows a void only on the same day as the charge, so a
 * late call returns `success: false` with the charge standing.
 */
export function paywayVoidOrder(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: PaywayVoidOrderArgs): Promise<PaywayResponse | Error> => {
        const url = createSecureUrl(urlArg, `/orders/${args.orderId}/payway/void`);

        const jwtToken = getJwt();

        if (!jwtToken) return new Error("jwt token is empty");

        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        headers.set("Content-Type", "application/json");

        const response = await safeFetch(url, {
            method: "POST",
            headers,
        });

        if (response instanceof Error) return response;

        return handleResponse<PaywayResponse>(response);
    };
}
