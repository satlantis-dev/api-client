import { assertEquals, assertInstanceOf } from "@std/assert";
import {
    InMemoryAccountContext,
    type NostrEvent,
    NostrKind,
    prepareNostrEvent,
    type Signer,
    type Tag,
} from "@blowater/nostr-sdk";
import type { Client } from "../sdk.ts";
import {
    applyFollowingChanges,
    nextCreatedAt,
    pickNewestContactList,
    updateFollowings,
} from "../nostr-helpers.ts";

// Offline: every event is signed locally and no relay or REST call is made.

const author = InMemoryAccountContext.Generate();
const alice = InMemoryAccountContext.Generate().publicKey;
const bob = InMemoryAccountContext.Generate().publicKey;
const carol = InMemoryAccountContext.Generate().publicKey;

const contactList = async (
    args: { created_at: number; tags?: Tag[]; content?: string; kind?: NostrKind; signer?: Signer },
) => {
    const event = await prepareNostrEvent(args.signer ?? author, {
        kind: args.kind ?? NostrKind.CONTACTS,
        content: args.content ?? "",
        tags: args.tags ?? [],
        created_at: args.created_at,
    });
    if (event instanceof Error) throw event;
    return event;
};

Deno.test("pickNewestContactList: newer relay copy beats an older one", async () => {
    const older = await contactList({ created_at: 1_000, tags: [["p", alice.hex]] });
    const newer = await contactList({ created_at: 2_000, tags: [["p", bob.hex]] });

    assertEquals(await pickNewestContactList([older, newer], author.publicKey.hex), newer);
    assertEquals(await pickNewestContactList([newer, older], author.publicKey.hex), newer);
});

Deno.test("pickNewestContactList: same created_at goes to the lower id", async () => {
    const a = await contactList({ created_at: 1_000, content: "a" });
    const b = await contactList({ created_at: 1_000, content: "b" });
    const lower = a.id < b.id ? a : b;

    assertEquals(await pickNewestContactList([a, b], author.publicKey.hex), lower);
    assertEquals(await pickNewestContactList([b, a], author.publicKey.hex), lower);
});

Deno.test("pickNewestContactList: rejects wrong kind, wrong author and tampered events", async () => {
    const valid = await contactList({ created_at: 1_000 });
    const wrongKind = await contactList({ created_at: 5_000, kind: NostrKind.TEXT_NOTE });
    const wrongAuthor = await contactList({ created_at: 5_000, signer: InMemoryAccountContext.Generate() });
    const tampered: NostrEvent = {
        ...(await contactList({ created_at: 5_000 })),
        tags: [["p", alice.hex]],
    };

    for (const invalid of [wrongKind, wrongAuthor, tampered]) {
        assertEquals(await pickNewestContactList([valid, invalid], author.publicKey.hex), valid);
    }
    assertEquals(await pickNewestContactList([tampered], author.publicKey.hex), undefined);
});

Deno.test("applyFollowingChanges: keeps petnames, relay hints, other tags and content", async () => {
    const base = await contactList({
        created_at: 1_000,
        content: '{"wss://relay.example":{"read":true,"write":true}}',
        tags: [
            ["p", alice.hex, "wss://alice.example", "alice"],
            ["t", "nostr"],
            ["p", bob.hex],
            ["client", "other-app"],
        ],
    });

    const result = applyFollowingChanges(base, { add: [carol.hex], remove: [bob.hex] });

    assertEquals(result.changed, true);
    assertEquals(result.content, base.content);
    assertEquals(result.tags, [
        ["p", alice.hex, "wss://alice.example", "alice"],
        ["t", "nostr"],
        ["client", "other-app"],
        ["p", carol.hex],
    ]);
});

Deno.test("applyFollowingChanges: remove drops every duplicate p tag", async () => {
    const base = await contactList({
        created_at: 1_000,
        tags: [["p", bob.hex], ["p", alice.hex], ["p", bob.hex, "wss://bob.example"]],
    });

    const result = applyFollowingChanges(base, { add: [], remove: [bob.hex] });

    assertEquals(result.tags, [["p", alice.hex]]);
    assertEquals(result.changed, true);
});

Deno.test("applyFollowingChanges: malformed p tags are preserved, not fatal", async () => {
    const base = await contactList({
        created_at: 1_000,
        tags: [["p", "not-a-pubkey"], ["p"], ["p", alice.hex]],
    });

    const result = applyFollowingChanges(base, { add: [bob.hex], remove: [] });

    assertEquals(result.tags, [["p", "not-a-pubkey"], ["p"], ["p", alice.hex], ["p", bob.hex]]);
});

Deno.test("applyFollowingChanges: no-op when already in the desired state", async () => {
    const base = await contactList({ created_at: 1_000, tags: [["p", alice.hex]] });

    const result = applyFollowingChanges(base, { add: [alice.hex, alice.hex], remove: [bob.hex] });

    assertEquals(result.changed, false);
    assertEquals(result.tags, [["p", alice.hex]]);
});

Deno.test("applyFollowingChanges: no base starts an empty list", () => {
    const result = applyFollowingChanges(undefined, { add: [alice.hex], remove: [] });

    assertEquals(result, { tags: [["p", alice.hex]], content: "", changed: true });
});

Deno.test("nextCreatedAt: moves past a base from the same second", async () => {
    const base = await contactList({ created_at: 1_000 });

    assertEquals(nextCreatedAt(base, 1_000), 1_001);
    assertEquals(nextCreatedAt(base, 1_500), 1_500);
    assertEquals(nextCreatedAt(undefined, 1_500), 1_500);
});

Deno.test("nextCreatedAt: moves past a future-dated base", async () => {
    const base = await contactList({ created_at: 9_000 });

    assertEquals(nextCreatedAt(base, 1_000), 9_001);
});

const fakeClient = (args: { accepts: boolean | Error; published: NostrEvent[] }) => {
    return {
        getNostrSigner: async () => author,
        getAccount: async () => ({ followingCount: 0 }),
        updateAccountFollowingList: async ({ event }: { event: NostrEvent }) => {
            args.published.push(event);
            return args.accepts;
        },
    } as unknown as Client;
};

Deno.test("updateFollowings: server answering false is an Error", async () => {
    const client = fakeClient({ accepts: false, published: [] });

    const result = await updateFollowings(client, { add: [alice], remove: [] }, async () => []);

    assertInstanceOf(result, Error);
});

Deno.test("updateFollowings: edits the last published list when relays lag behind", async () => {
    const published: NostrEvent[] = [];
    const client = fakeClient({ accepts: true, published });
    const stale = await contactList({
        created_at: Math.floor(Date.now() / 1000) - 60,
        tags: [["p", carol.hex, "", "carol"]],
    });
    const relaysStillServeStale = async () => [stale];

    assertEquals(await updateFollowings(client, { add: [alice], remove: [] }, relaysStillServeStale), true);
    assertEquals(
        await updateFollowings(client, { add: [bob], remove: [carol] }, relaysStillServeStale),
        true,
    );

    assertEquals(published.length, 2);
    assertEquals(published[1].tags, [["p", alice.hex], ["p", bob.hex]]);
    assertEquals(published[1].created_at > published[0].created_at, true);
});
