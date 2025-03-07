import { assertEquals, assertExists, assertGreaterOrEqual, fail } from "@std/assert";
import { Client } from "../sdk.ts";
import { InMemoryAccountContext } from "@blowater/nostr-sdk";
import type { LocationResolver, UserResolver } from "../sdk.ts";
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
const res = await clientNoAuth.loginNostr(signer, { name: "test" });
if (res instanceof Error) fail(res.message);

const client = Client.New({
    baseURL: rest_url,
    getJwt: () => res.token,
    getNostrSigner: async () => signer,
    relay_url,
    aws_cdn_url,
});
if (client instanceof Error) {
    fail(client.message);
}

Deno.test("notes without places", async () => {
    const contents = [];

    // First, I post 3 notes
    for (let i = 0; i < 3; i++) {
        const res = await client.postNote({
            content: `note ${i + 1}`,
            image: new File(["test content"], "test-upload-file.txt"),
        });
        if (res instanceof Error) {
            fail(res.message);
        }
        contents.push(res.content);
    }

    // wait for the backend to process all data because it's kinda slow
    await sleep(3000);

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
        const user = (await client.resolver.getUser(
            signer.publicKey,
        )) as UserResolver;

        const notes = await user.getNotes({ limit: 10 });
        if (notes instanceof Error) fail(notes.message);

        assertEquals(notes.length == 3, true);
        assertEquals(notes.map((n) => n.content).reverse(), contents);

        const notes2 = await user.getNotesFromRestAPI({ limit: 10 });
        if (notes2 instanceof Error) fail(notes2.message);

        assertEquals(notes2.length, notes.length);

        // the note returned by backends are not sorted in created time order
        assertEquals(
            new Set(notes2.map((n) => n.content).reverse()),
            new Set(contents),
        );
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
            image: new File(["test content"], "test-upload-file.txt"),
            placeID: place.id,
        });
        if (res instanceof Error) {
            fail(res.message);
        }
        contents.push(res.content);
    }

    const user = (await client.resolver.getUser(
        signer.publicKey,
    )) as UserResolver;
    const account = await user.getAccount();
    if (account instanceof Error) {
        fail(account.message);
    }

    const notes = await client.getPlaceNotes({
        accountID: account.id,
        placeID: place.id,
        page: 1,
        limit: 10,
    });
    if (notes instanceof Error) {
        fail(notes.message);
    }

    assertEquals(
        notes.slice(0, 1).map((n) => n.content),
        contents,
    );
});

Deno.test("getLocation", async (t) => {
    const id = 1889;
    const place_id = 28564;
    const expectedName = "Snack bar São João";
    const errors: string[] = [];
    let byLocationId: LocationResolver;
    let byPlaceId: LocationResolver;

    await t.step("getLocationByID", async () => {
        try {
            const _byLocationId = await client.resolver.getLocationByID(id);
            if (_byLocationId instanceof Error) {
                fail(_byLocationId.message);
            }
            byLocationId = _byLocationId;
            assertExists(byLocationId, "Location should exist");
            assertExists(byLocationId.isClaimed, "isClaimed should exist");
            assertEquals(byLocationId.id, id, `id should be ${id}`);
            assertEquals(byLocationId.name, expectedName, `name should be "${expectedName}"`);
        } catch (error) {
            fail(`getLocationByID failed: ${error}`);
        }
    });

    await t.step("getLocationsByPlaceID", async () => {
        try {
            const locations = await client.resolver.getLocationsByPlaceID({
                placeID: place_id,
                search: expectedName,
            });
            if (locations instanceof Error) {
                fail(locations.message);
            }

            assertExists(locations, "Locations should exist");

            const _byPlaceId = locations.find((l) => l.id === id);
            if (!_byPlaceId) {
                fail("The same location is not returned from the getLocationsByPlaceID API");
            }
            byPlaceId = _byPlaceId;

            const byLocationId = await client.resolver.getLocationByID(id);
            assertExists(byLocationId, "Location should exist");

            const assertProperty = <T>(property: string, value: T, expectedValue: T) => {
                if (value === undefined) {
                    errors.push(`${property} should not be undefined from the getLocationsByPlaceID API`);
                }
                if (expectedValue === undefined) {
                    errors.push(`${property} should not be undefined from the getLocationByID API`);
                }
                if (value !== expectedValue) {
                    errors.push(`${property} should be ${expectedValue}, but got ${value}`);
                }
            };

            if (byLocationId instanceof Error) {
                fail(byLocationId.message);
            }
            assertProperty("id", byPlaceId.id, byLocationId.id);
            assertProperty("name", byPlaceId.name, byLocationId.name);
            assertProperty("address.formatted", byPlaceId.address.formatted, byLocationId.address.formatted);
            assertProperty("bio", byPlaceId.bio, byLocationId.bio);
            assertProperty("email", byPlaceId.email, byLocationId.email);
            assertProperty("rating", byPlaceId.rating, byLocationId.rating);
            assertProperty("userRatingCount", byPlaceId.userRatingCount, byLocationId.userRatingCount);
            assertProperty("googleMapsUrl", byPlaceId.googleMapsUrl, byLocationId.googleMapsUrl);
            assertProperty("hook", byPlaceId.hook, byLocationId.hook);
            assertProperty("image", byPlaceId.image, byLocationId.image);
            assertProperty("isClaimed", byPlaceId.isClaimed, byLocationId.isClaimed);
            assertProperty("lat", byPlaceId.lat, byLocationId.lat);
            assertProperty("lng", byPlaceId.lng, byLocationId.lng);
            assertProperty(
                "locationTags[0].id",
                byPlaceId.locationTags[0].id,
                byLocationId.locationTags[0].id,
            );
            assertProperty(
                "openingHours.saturday",
                byPlaceId.openingHours.saturday,
                byLocationId.openingHours.saturday,
            );
            assertProperty("osmRef", byPlaceId.osmRef, byLocationId.osmRef);
            assertProperty("placeId", byPlaceId.placeId, byLocationId.placeId);
            assertProperty("reviewSummary", byPlaceId.reviewSummary, byLocationId.reviewSummary);
            assertProperty("place.osmRef", byPlaceId.place?.osmRef, byLocationId.placeOsmRef);

            if (errors.length > 0) {
                console.error("Test failed with the following errors:");
                errors.forEach((error) => console.error(error));
                fail("One or more assertions failed");
            }
        } catch (error) {
            fail(`getLocationsByPlaceID failed: ${error}`);
        }
    });
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
    const notes = await client.resolver.getGlobalFeedsOfLoginUser({
        page: 1,
        limit: 3,
    });
    if (notes instanceof Error) fail(notes.message);
    console.warn("TODO: need to implement the test");
    // assertEquals(notes.length, 3);
});

Deno.test("getMyProfile useCache", async () => {
    const u1 = await client.getMyProfile();
    const u2 = await client.getMyProfile({ useCache: false });
    assertEquals(u1 != u2, true); // not the same reference
    const u3 = await client.getMyProfile({ useCache: true });
    assertEquals(u2, u3); // same reference
});

Deno.test("getUser useCache", async () => {
    const u1 = await client.resolver.getUser(signer.publicKey);
    const u2 = await client.resolver.getUser(signer.publicKey);
    assertEquals(u1 != u2, true); // not the same reference
    const u3 = await client.resolver.getUser(signer.publicKey, {
        useCache: true,
    });
    assertEquals(u2, u3); // same reference
    const u4 = await client.resolver.getUser(signer.publicKey, {
        useCache: false,
    });
    assertEquals(u3 != u4, true); // same reference
});

Deno.test("deleteAccount", async () => {
    const ok = await client.deleteAccount();
    assertEquals(ok, true);
});

Deno.test("getPlacesMinimal", async () => {
    const places = await client.getPlacesMinimal({
        filters: { name: "" },
        limit: 100,
        page: 1,
        sortColumn: "id",
        sortDirection: "asc",
    });
    if (places instanceof Error) {
        fail(places.message);
    }
    assertGreaterOrEqual(places.length, 90);
});

Deno.test("getLocationsBySearch", async () => {
    const result = await client.resolver.getLocationsBySearch({
        rating: 0,
        tag_category: "Restaurants & Cafes",
        search: "Dragon",
    });
    if (result instanceof Error) {
        fail(result.message);
    }
    assertEquals(result.length, 1);
});

Deno.test("getLocationsByPlaceIDRandomized", async () => {
    const result = await client.resolver.getLocationsByPlaceIDRandomized({
        placeId: 28564,
    });
    if (result instanceof Error) {
        fail(result.message);
    }
    assertEquals(result.length, 10);
});
