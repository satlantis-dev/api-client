import { assertEquals, fail } from "@std/assert";
import { Client } from "../sdk.ts";
import { InMemoryAccountContext } from "@blowater/nostr-sdk";
import type { UserResolver } from "../sdk.ts";

const testURL = new URL("https://api-dev.satlantis.io");
const relay_url = "wss://relay.satlantis.io";
const clientNoAuth = Client.New({
    baseURL: testURL,
    relay_url,
});
if (clientNoAuth instanceof Error) {
    fail(clientNoAuth.message);
}
const signer = InMemoryAccountContext.Generate();
const res = await clientNoAuth.loginNostr(signer);
if (res instanceof Error) fail(res.message);

const client = Client.New({
    baseURL: "https://api-dev.satlantis.io",
    getJwt: () => res.token,
    getNostrSigner: async () => signer,
    relay_url,
}) as Client;

Deno.test("notes without places", async () => {
    const contents = [];
    for (let i = 0; i < 3; i++) {
        const res = await client.postNote({
            content: "hello Satlantis",
            image: new File(
                ["test content"],
                "test-upload-file.txt",
            ),
        });
        if (res instanceof Error) {
            fail(res.message);
        }
        contents.push(res.event.content);
    }

    {
        // @ts-ignore: test private
        const notes = await client.getNotes({
            npub: signer.publicKey.bech32(),
            limit: 10,
            page: 1,
        });
        if (notes instanceof Error) {
            fail(notes.message);
        }

        assertEquals(notes.map((n) => n.content).reverse(), contents);
    }

    {
        const result = await client.getNotesOf({
            pubkey: signer.publicKey,
            page: {
                limit: 10,
                offset: 0,
            },
        });
        if (result instanceof Error) {
            fail(result.message);
        }

        const data = await Array.fromAsync(result);
        assertEquals(data.length == 3, true);
        assertEquals(data.map((n) => n.content).reverse(), contents);
    }
    {
        const user = await client.getUserProfile(signer.publicKey) as UserResolver;

        const notes = await user.getNotes({ limit: 10 });
        if (notes instanceof Error) fail(notes.message);

        const data = await Array.fromAsync(notes);
        assertEquals(data.length == 3, true);
        assertEquals(data.map((n) => n.content).reverse(), contents);
    }
});

Deno.test("notes in a place", async () => {
    const contents = [];
    const place = await client.getPlaceByOsmRef({ osmRef: "R7426387" });
    if (place instanceof Error) {
        fail(place.message);
    }

    for (let i = 0; i < 1; i++) {
        const res = await client.postNote({
            content: "hello Satlantis",
            image: new File(
                ["test content"],
                "test-upload-file.txt",
            ),
            placeID: place.id,
        });
        if (res instanceof Error) {
            fail(res.message);
        }
        contents.push(res.event.content);
    }

    const notes = await client.getPlaceNoteFeed({ placeID: place.id });
    if (notes instanceof Error) {
        fail(notes.message);
    }

    assertEquals(notes.slice(0, 1).map((n) => n.note.content), contents);
});

Deno.test("getLocation", async () => {
    const result = await client.getLocation(1889);
    if (result instanceof Error) {
        fail(result.message);
    }
    assertEquals(result.id, 1889);
    assertEquals(result.name, "Snack bar São João");
    assertEquals(result.placeID, 28564);
    assertEquals((await result.place()).osmId, 1);
});

Deno.test("a user's interests", async () => {
    const user = await client.getMyProfile();
    if (user instanceof Error) {
        fail(user.message);
    }

    const interests = await user.getInterests();
    if (interests instanceof Error) {
        fail(interests.message);
    }
    assertEquals(interests, []);

    const err = await client.updateMyInterests(["food"]);
    if (err instanceof Error) fail(err.message);

    assertEquals(user.interests, ["food"]);
});
