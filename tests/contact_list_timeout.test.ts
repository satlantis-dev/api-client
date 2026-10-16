import { assert, assertEquals, assertInstanceOf } from "@std/assert";
import { InMemoryAccountContext, NostrKind, prepareNostrEvent } from "@blowater/nostr-sdk";
import { getContactList, RelayReadTimeout } from "../nostr-helpers.ts";

// Local fake relays on 127.0.0.1; nothing leaves the machine.

const author = InMemoryAccountContext.Generate();
const TIMEOUT_MS = 300;

type RelayBehaviour = "refuse" | "silent" | "answer";

const startRelay = (behaviour: RelayBehaviour, reply: unknown[] = []) => {
    const sockets = new Set<WebSocket>();
    const server = Deno.serve({ hostname: "127.0.0.1", port: 0, onListen: () => {} }, (req) => {
        if (behaviour === "refuse") {
            return new Response("Bad Request", { status: 400 });
        }
        const { socket, response } = Deno.upgradeWebSocket(req);
        sockets.add(socket);
        socket.onclose = () => sockets.delete(socket);
        socket.onmessage = (message) => {
            const [type, subID] = JSON.parse(message.data);
            if (behaviour !== "answer" || type !== "REQ") return;
            for (const event of reply) socket.send(JSON.stringify(["EVENT", subID, event]));
            socket.send(JSON.stringify(["EOSE", subID]));
        };
        return response;
    });
    return {
        url: `ws://127.0.0.1:${server.addr.port}`,
        stop: async () => {
            sockets.forEach((socket) => socket.close());
            await server.shutdown();
        },
    };
};

// The SDK leaves its reconnect loop and timers running briefly after a timed-out relay is closed.
const relayTest = (name: string, fn: () => Promise<void>) =>
    Deno.test({ name, fn, sanitizeOps: false, sanitizeResources: false });

relayTest("getContactList: a relay that refuses the connection times out", async () => {
    const relay = startRelay("refuse");
    const startedAt = Date.now();
    const result = await getContactList(relay.url, author.publicKey, NostrKind.CONTACTS, TIMEOUT_MS);
    assertInstanceOf(result, RelayReadTimeout);
    assert(Date.now() - startedAt < TIMEOUT_MS * 5, "resolved near the timeout");
    await relay.stop();
});

relayTest("getContactList: a relay that never sends EOSE times out", async () => {
    const relay = startRelay("silent");
    const result = await getContactList(relay.url, author.publicKey, NostrKind.CONTACTS, TIMEOUT_MS);
    assertInstanceOf(result, RelayReadTimeout);
    await relay.stop();
});

relayTest("getContactList: a relay that answers returns its newest event", async () => {
    const event = await prepareNostrEvent(author, {
        kind: NostrKind.CONTACTS,
        content: "",
        tags: [],
        created_at: 1_000,
    });
    if (event instanceof Error) throw event;
    const relay = startRelay("answer", [event]);
    const result = await getContactList(relay.url, author.publicKey, NostrKind.CONTACTS, TIMEOUT_MS);
    assertEquals(result, event);
    await relay.stop();
});
