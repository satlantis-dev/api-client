import { assert, assertEquals, assertInstanceOf } from "@std/assert";
import { InMemoryAccountContext } from "@blowater/nostr-sdk";
import { type EventTicketPurchasePayload, purchaseEventTicket } from "../api/events.ts";
import type { func_GetNostrSigner } from "../sdk.ts";

// Offline: fetch is stubbed, so these tests need no api or relay.

const baseURL = new URL("https://api.example.test");

const calendarEvent = {
    accountId: 1,
    calendarEventId: 2,
    dtag: "dtag",
    pubkey: InMemoryAccountContext.Generate().publicKey.hex,
};

const newPayload = (): EventTicketPurchasePayload => ({
    ticketTypeOrders: [],
    rsvpData: { status: "accepted", calendarEventId: 2, registrationAnswers: [] },
    email: "",
    name: "",
});

// Calls purchaseEventTicket with fetch stubbed and returns the JSON body it posted (undefined when no
// request was sent) together with the function's result.
const purchaseWith = async (getNostrSigner: func_GetNostrSigner) => {
    let body: EventTicketPurchasePayload | undefined;
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (_input, init) => {
        body = JSON.parse(String(init?.body));
        return new Response(JSON.stringify({ id: 10 }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    };
    try {
        const result = await purchaseEventTicket(baseURL, () => "jwt", getNostrSigner)(
            2,
            newPayload(),
            calendarEvent,
        );
        return { result, body };
    } finally {
        globalThis.fetch = realFetch;
    }
};

Deno.test("purchaseEventTicket: signs the RSVP event when the signer can sign", async () => {
    const signer = InMemoryAccountContext.Generate();
    const { result, body } = await purchaseWith(async () => signer);

    assert(!(result instanceof Error), String(result));
    assertEquals(body?.rsvpData.event?.kind, 31925);
    assertEquals(body?.rsvpData.event?.pubkey, signer.publicKey.hex);
});

Deno.test("purchaseEventTicket: orders without the RSVP event when there is no signer", async () => {
    const { result, body } = await purchaseWith(async () => new Error("not signed in"));

    assert(!(result instanceof Error), String(result));
    assert(body, "the order was not sent");
    assertEquals(body.rsvpData.event, undefined);
});

Deno.test("purchaseEventTicket: orders without the RSVP event when signing fails (read-only session)", async () => {
    // A read-only session has a signer, but the api holds no key to sign with, so signEvent fails.
    const real = InMemoryAccountContext.Generate();
    const failingSigner = Object.assign(Object.create(Object.getPrototypeOf(real)), real, {
        signEvent: async () => new Error("unable to sign"),
    }) as InMemoryAccountContext;
    assertInstanceOf(await failingSigner.signEvent({} as never), Error);

    const { result, body } = await purchaseWith(async () => failingSigner);

    assert(!(result instanceof Error), String(result));
    assert(body, "the order was not sent");
    assertEquals(body.rsvpData.event, undefined);
    assertEquals(body.rsvpData.status, "accepted");
});
