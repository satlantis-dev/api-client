import { assertEquals, fail } from "@std/assert";

import { Client, getPubkeyByNip05, loginNostr, type Place } from "../sdk.ts";
import { InMemoryAccountContext, PublicKey, SingleRelayConnection } from "@blowater/nostr-sdk";
import type { ApiError } from "../helpers/_helper.ts";

const url = new URL("https://api-dev.satlantis.io");
const relay = SingleRelayConnection.New("wss://relay.satlantis.io") as SingleRelayConnection
const clientNoAuth = Client.New({ baseURL: url, relay });
if (clientNoAuth instanceof Error) {
    fail(clientNoAuth.message);
}

// we can run this test suit in github action
// so that we always have up to date client SDK
Deno.test("getPlace", async () => {
    const result = await clientNoAuth.getPlace({
        osmRef: "R8421413",
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result.regionId);
});

Deno.test("getPlaces", async () => {
    const result = await clientNoAuth.getPlaces({
        filters: { name: "london" },
        limit: 1,
        page: 0,
        sortColumn: "score",
        sortDirection: "desc",
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }

    const ok = result.find((p) => p.name.toLowerCase() == "london") as Place;
    assertEquals(ok.name.toLowerCase(), "london");
});

Deno.test("/getPeopleOfPlace", async () => {
    const result = await clientNoAuth.getAccountPlaceRoles({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("/getPlaceNoteFeed", async () => {
    const result = await clientNoAuth.getPlaceNoteFeed({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
});

Deno.test("/getPlaceCalendarEvents", async () => {
    const result = await clientNoAuth.getPlaceCalendarEvents({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
});

Deno.test("/getPlaceMetrics", async () => {
    const result = await clientNoAuth.getPlaceMetrics({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
});

Deno.test("/getPlaceCalenderEvents", async () => {
    const result = await clientNoAuth.getPlaceCalendarEvents({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
});

Deno.test("/getPlaceChats", async () => {
    const result = await clientNoAuth.getPlaceChats({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("/getPlaceCategoryScores", async () => {
    const result = await clientNoAuth.getPlaceCategoryScores({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
});

Deno.test("getPlaceEvent", async () => {
    const result = await clientNoAuth.getPlaceEvent({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("getRegion", async () => {
    const result = await clientNoAuth.getRegion({
        regionID: 1170,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.places.length > 0, true);
});

Deno.test("/getLocationsWithinBoundingBox", async () => {
    const result = await clientNoAuth.getLocationsWithinBoundingBox({
        sw_lat: 32.56768764046221,
        ne_lat: 32.766068258492425,
        ne_lng: -16.800802131347382,
        sw_lng: -17.04730786865258,
        google_rating: 0,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
});

Deno.test("getLocationTags", async () => {
    const result = await clientNoAuth.getLocationTags();
    if (result instanceof Error) {
        fail(result.message);
    }
    assertEquals(result.length > 0, true);
});

Deno.test("nip5", async () => {
    {
        const result = await getPubkeyByNip05({
            name: randomString(),
            domain: "https://dev.satlantis.io",
        });
        if (result instanceof Error) {
            console.log(result);
            fail();
        }
        assertEquals(result, undefined);
    }
    {
        const result = await getPubkeyByNip05({ name: "123", domain: "https://www.dev.satlantis.io" });
        if (result instanceof Error) {
            console.log(result);
            fail();
        }
        assertEquals(
            result,
            PublicKey.FromHex("65dff7c1f841ed83380ddd069c2d4a2dcbea3c968b4ffc80769b4eb5518fe2d8"),
        );
    }
    // {
    //     const result = await getPubkeyByNip05({ name: "svetski", domain: "https://www.dev.satlantis.io" });
    //     if (result instanceof Error) {
    //         console.log(result);
    //         fail();
    //     }
    //     assertEquals(
    //         result,
    //         PublicKey.FromHex("65dff7c1f841ed83380ddd069c2d4a2dcbea3c968b4ffc80769b4eb5518fe2d8"),
    //     );
    // }
});

Deno.test("getAccount", async () => {
    const npub = "npub1le59glyc3r9zsddury0fu8wyqu69ckvj78fn4425m5xn9zd0zpdssjtd53";
    const result = await clientNoAuth.getAccount({
        npub,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.npub, npub);
});

Deno.test({
    name: "createAccount",
    // ignore: true,
    fn: async () => {
        {
            const result = await clientNoAuth.createAccount({
                email: "user@email.com",
                password: "simple",
                username: "hi3",
            });
            if (!(result instanceof Error)) {
                fail("shoud be error");
            }
            assertEquals(result.message, "status 400, body Username or email already exists\n");
        }
        {
            const result = await clientNoAuth.createAccount({
                email: "user@email.com",
                password: "simple",
                username: "hi",
            });
            if (!(result instanceof Error)) {
                fail("shoud be error");
            }
            assertEquals(result.message, "status 400, body Username must be at least 3 characters\n");
        }
        {
            const result = await clientNoAuth.createAccount({
                email: `${randomString()}@email.com`,
                password: "simple",
                username: randomString(),
            });
            if (result instanceof Error) {
                console.log(result);
                fail(result.message);
            }
            assertEquals(result, true);
        }
    },
});

Deno.test("loginNostr", async () => {
    const signer = InMemoryAccountContext.Generate();
    const res = await loginNostr(url)(signer);
    if (res instanceof Error) fail(res.message);
});

Deno.test("login", async () => {
    {
        const result = await clientNoAuth.login({
            username: randomString(),
            password: "password",
        });
        if (result instanceof Error) {
            fail(result.message);
        }
        assertEquals(result, undefined);
    }
    {
        const username = randomString();
        const password = "simple";
        // create account
        const ok = await clientNoAuth.createAccount({
            email: `${randomString()}@email.com`,
            password,
            username,
        });
        if (ok instanceof Error) {
            fail(ok.message);
        }
        assertEquals(ok, true);
        // login with this account
        const result = await clientNoAuth.login({
            username,
            password,
        });
        if (result instanceof Error) {
            fail(result.message);
        }
        if (result == "invalid password") {
            fail(JSON.stringify(result));
        }
        if (result == undefined) {
            fail("the user should exist");
        }

        const p1 = PublicKey.FromHex(result.account.pubKey);
        const p2 = PublicKey.FromBech32(result.account.npub);
        assertEquals(p1, p2);
        assertEquals(result.account.name, username);
        assertEquals(result.account.displayName, username);
    }
});

Deno.test("getNotes", async () => {
    const result = await clientNoAuth.getNotes({
        npub: "npub1le59glyc3r9zsddury0fu8wyqu69ckvj78fn4425m5xn9zd0zpdssjtd53",
        limit: 2,
        page: 0,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length == 2, true);

    const note = await clientNoAuth.getNote({ noteID: result[0].id });
    if (note instanceof Error) fail(note.message);
    if (note == undefined) fail(`${result[0].id} should be present`);

    // should be the same ntoe
    assertEquals(note.itself.id, result[0].id);
    assertEquals(note.itself.event.content, result[0].event.content);
    assertEquals(note.itself.event.sig, result[0].event.sig);
});

Deno.test("getIpInfo", async () => {
    const result = await clientNoAuth.getIpInfo();
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(JSON.stringify(result));
});

Deno.test("getLocationReviews", async () => {
    const result = await clientNoAuth.getLocationReviews({
        limit: 2,
        page: 0,
        locationId: 2313,
    });
    if (result instanceof Error) fail(result.message);
    console.log(result);
});

Deno.test("addressLookup", async () => {
    const result = await clientNoAuth.addressLookup({
        address: "paris",
    });
    if (result instanceof Error) fail(result.message);
    assertEquals(result, [
        {
            displayName: { text: "Paris", languageCode: "en" },
            formattedAddress: "Paris, France",
            geometry: { location: { lat: 0, lng: 0 } },
            priceLevel: "",
        },
    ]);
});

Deno.test("initiatePasswordReset", async () => {
    const result = await clientNoAuth.initiatePasswordReset({
        username: "albert",
    });
    if (result instanceof Error) fail(result.message);
    console.log(result);
});

Deno.test("resetPassword", async () => {
    // todo: this is not testing anything
    const result = (await clientNoAuth.resetPassword({
        password: "********",
        token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOjI2OTkxNCwiZXhwIjoxNzI1NjMzMzc0fQ.ihDjFSde5HS2qCbMquNy4qjwDPlFRAZx4km7tCF04kI",
    })) as ApiError;
    assertEquals(result.status, 404);
    assertEquals(result.message, "status 404, body record not found\n");
});

Deno.test("verifyEmail", async () => {
    const result = (await clientNoAuth.verifyEmail({
        token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOjI1NTU1NywiZXhwIjoxNzI0OTg5MDU4fQ.TH_YBHlVXkOhl2ZjPop-Xkt7tCgUi0aUMND-W0oD5rk",
    })) as ApiError;
    assertEquals(result.status, 403);
    assertEquals(result.message, "status 403, body Token doesn't exist\n");
});

export function randomString() {
    return String(Date.now());
}
