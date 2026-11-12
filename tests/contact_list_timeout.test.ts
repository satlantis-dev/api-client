import { assert, assertEquals, assertInstanceOf } from "@std/assert";
import { InMemoryAccountContext, NostrKind, prepareNostrEvent } from "@blowater/nostr-sdk";
import { getContactList, RelayReadTimeout, ReplaceableEventRead } from "../nostr-helpers.ts";

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
            // Let the client's own close finish first: closing both ends at once makes Deno 2.9 fire the
            // client's close event twice, and the SDK throws an uncaught error on the second one.
            for (let i = 0; sockets.size > 0 && i < 40; i++) {
                await new Promise((resolve) => setTimeout(resolve, 25));
            }
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

const contactList = async (createdAt: number) => {
    const event = await prepareNostrEvent(author, {
        kind: NostrKind.CONTACTS,
        content: "",
        tags: [],
        created_at: createdAt,
    });
    if (event instanceof Error) throw event;
    return event;
};

const READ_TIMEOUT_MS = 1_500;

const read = (ownRelay: string, relays: string[], seal = true) => {
    const reader = new ReplaceableEventRead(
        author.publicKey,
        NostrKind.CONTACTS,
        [ownRelay],
        3,
        1,
        READ_TIMEOUT_MS,
    );
    reader.add(relays);
    if (seal) reader.seal();
    return reader;
};

const createdAts = (events: { created_at: number }[]) =>
    events.map((event) => event.created_at).sort((a, b) => a - b);

const elapsed = (startedAt: number) => Date.now() - startedAt;

relayTest("ReplaceableEventRead: doesn't wait for the slowest relay once the others finished", async () => {
    const ours = startRelay("answer", [await contactList(1_000)]);
    const other = startRelay("answer", [await contactList(900)]);
    const empty = startRelay("answer", []);
    const slow = startRelay("silent");
    const startedAt = Date.now();
    const events = await read(ours.url, [other.url, empty.url, slow.url]).result;
    assert(elapsed(startedAt) < READ_TIMEOUT_MS, "did not wait for the silent relay");
    assertEquals(createdAts(events), [900, 1_000]);
    await Promise.all([ours.stop(), other.stop(), empty.stop(), slow.stop()]);
});

relayTest("ReplaceableEventRead: two slow relays are waited for until the timeout", async () => {
    const ours = startRelay("answer", [await contactList(1_000)]);
    const other = startRelay("answer", [await contactList(900)]);
    const slowA = startRelay("silent");
    const slowB = startRelay("silent");
    const startedAt = Date.now();
    const events = await read(ours.url, [other.url, slowA.url, slowB.url]).result;
    assert(elapsed(startedAt) >= READ_TIMEOUT_MS * 0.9, "waited for one of the two slow relays");
    assertEquals(createdAts(events), [900, 1_000]);
    await Promise.all([ours.stop(), other.stop(), slowA.stop(), slowB.stop()]);
});

relayTest("ReplaceableEventRead: three copies including ours stop the read, even before seal", async () => {
    const ours = startRelay("answer", [await contactList(1_000)]);
    const a = startRelay("answer", [await contactList(900)]);
    const b = startRelay("answer", [await contactList(800)]);
    const slowA = startRelay("silent");
    const slowB = startRelay("silent");
    const startedAt = Date.now();
    const events = await read(ours.url, [a.url, b.url, slowA.url, slowB.url], false).result;
    assert(elapsed(startedAt) < READ_TIMEOUT_MS, "did not wait for the silent relays");
    assertEquals(createdAts(events), [800, 900, 1_000]);
    await Promise.all([ours.stop(), a.stop(), b.stop(), slowA.stop(), slowB.stop()]);
});

relayTest("ReplaceableEventRead: three copies without ours don't stop the read", async () => {
    const ours = startRelay("answer", []);
    const a = startRelay("answer", [await contactList(900)]);
    const b = startRelay("answer", [await contactList(800)]);
    const c = startRelay("answer", [await contactList(700)]);
    const slowA = startRelay("silent");
    const slowB = startRelay("silent");
    const startedAt = Date.now();
    const events = await read(ours.url, [a.url, b.url, c.url, slowA.url, slowB.url]).result;
    assert(elapsed(startedAt) >= READ_TIMEOUT_MS * 0.9, "waited for one of the two slow relays");
    assertEquals(createdAts(events), [700, 800, 900]);
    await Promise.all([ours.stop(), a.stop(), b.stop(), c.stop(), slowA.stop(), slowB.stop()]);
});

relayTest("ReplaceableEventRead: before seal it waits, and reads relays added later", async () => {
    const ours = startRelay("answer", [await contactList(1_000)]);
    const other = startRelay("answer", []);
    const laterA = startRelay("answer", [await contactList(1_100)]);
    const laterB = startRelay("answer", [await contactList(1_200)]);
    const reader = read(ours.url, [other.url], false);
    let settled = false;
    reader.result.then(() => settled = true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    assert(!settled, "not sealed: still waiting although all but one finished");
    reader.add([laterA.url, laterB.url]);
    reader.seal();
    const events = await reader.result;
    const found = createdAts(events);
    assertEquals(found[0], 1_000);
    assert(found.includes(1_100) || found.includes(1_200), "read a relay added later");
    await Promise.all([ours.stop(), other.stop(), laterA.stop(), laterB.stop()]);
});

relayTest("ReplaceableEventRead: our relay is never the slowest one skipped", async () => {
    const ours = startRelay("silent");
    const a = startRelay("answer", [await contactList(900)]);
    const b = startRelay("answer", [await contactList(800)]);
    const empty = startRelay("answer", []);
    const startedAt = Date.now();
    const events = await read(ours.url, [a.url, b.url, empty.url]).result;
    assert(elapsed(startedAt) >= READ_TIMEOUT_MS * 0.9, "waited for our relay");
    assertEquals(createdAts(events), [800, 900]);
    await Promise.all([ours.stop(), a.stop(), b.stop(), empty.stop()]);
});
