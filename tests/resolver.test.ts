import { assertEquals, fail } from "@std/assert";
import { Client } from "../sdk.ts";
import { InMemoryAccountContext } from "@blowater/nostr-sdk";
import type { UserResolver } from "../sdk.ts";
import { sleep } from "jsr:@blowater/csp@1.0.0";
import { aws_cdn_url, relay_url, rest_url } from "./urls.ts";

const clientNoAuth = Client.New({
    baseURL: rest_url,
    relay_url,
    aws_cdn_url,
});
if (clientNoAuth instanceof Error) {
    fail(clientNoAuth.message);
}
const signer = InMemoryAccountContext.Generate();
const res = await clientNoAuth.loginNostr(signer);
if (res instanceof Error) fail(res.message);

const client = Client.New({
    baseURL: rest_url,
    getJwt: () => res.token,
    getNostrSigner: async () => signer,
    relay_url,
    aws_cdn_url,
}) as Client;

Deno.test("notes without places", async () => {
    const contents = [];

    // First, I post 3 notes
    for (let i = 0; i < 3; i++) {
        const res = await client.postNote({
            content: `note ${i + 1}`,
            image: new File(
                ["test content"],
                "test-upload-file.txt",
            ),
        });
        if (res instanceof Error) {
            fail(res.message);
        }
        contents.push(res.content);
    }

    // wait for the backend to process all data because it's kinda slow
    await sleep(1000);

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
        const user = await client.resolver.getUser(signer.publicKey) as UserResolver;

        const notes = await user.getNotes({ limit: 10 });
        if (notes instanceof Error) fail(notes.message);

        assertEquals(notes.length == 3, true);
        assertEquals(notes.map((n) => n.content).reverse(), contents);

        const notes2 = await user.getNotesFromRestAPI({ limit: 10 });
        if (notes2 instanceof Error) fail(notes2.message);

        assertEquals(notes2.length, notes.length);
        assertEquals(notes2.map((n) => n.content).reverse(), contents);
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
        contents.push(res.content);
    }

    const notes = await client.getPlaceNoteFeed({ placeID: place.id });
    if (notes instanceof Error) {
        fail(notes.message);
    }

    assertEquals(notes.slice(0, 1).map((n) => n.note.content), contents);
});

Deno.test("getLocation", async () => {
    const id = 1889;
    const result = await client.resolver.getLocationByID(id);
    if (result instanceof Error) {
        fail(result.message);
    }
    assertEquals(result.id, id);
    assertEquals(result.name, "Snack bar São João");
    assertEquals(result.placeOsmRef, "R8421413");

    const place = await result.place();
    if (place instanceof Error) {
        fail(place.message);
    }

    assertEquals(place.name, "Funchal");

    const locations = await client.resolver.getLocationsByPlaceID({ placeID: place.id });
    if (locations instanceof Error) fail(locations.message);

    const location = locations.find((l) => l.id == id);
    if (location == undefined) {
        fail("the same location is not returned from the getLocationsByPlaceID API");
    }
    assertEquals(location.id, result.id);
    assertEquals(location.name, result.name);
    assertEquals(location.openingHours, result.openingHours);
    assertEquals(location.address, result.address);
    assertEquals(location.score, result.score);
    assertEquals(location.googleRating, result.googleRating);
    // assertEquals(location.placeOsmRef, result.placeOsmRef);
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

Deno.test("global feed", async () => {
    const notes = await client.resolver.getGlobalFeed({ page: 1, limit: 3 });
    if (notes instanceof Error) fail(notes.message);

    assertEquals(notes.length, 3);
});
