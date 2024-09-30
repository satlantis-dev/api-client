import { assertEquals, fail } from "@std/assert";

import { Client, loginNostr, type Place } from "../sdk.ts";
import {
    InMemoryAccountContext,
    type NostrEvent,
    PrivateKey,
    PublicKey,
    SingleRelayConnection,
} from "@blowater/nostr-sdk";
import type { ApiError } from "../helpers/_helper.ts";
import type { UserResolver } from "../resolvers/user.ts";

const url = new URL("https://api-dev.satlantis.io");
const testSigner = InMemoryAccountContext.Generate();
const client = Client.New({
    baseURL: url,
    relay_url: "wss://relay.satlantis.io",
    getNostrSigner: async () => {
        return testSigner;
    },
});
if (client instanceof Error) {
    fail(client.message);
}

// we can run this test suit in github action
// so that we always have up to date client SDK
Deno.test("getPlace", async () => {
    const result = await client.getPlaceByOsmRef({
        osmRef: "R8421413",
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result.regionId);
});

Deno.test("getPlaces", async () => {
    const result = await client.getPlaces({
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
    const result = await client.getAccountPlaceRoles({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("/getPlaceNoteFeed", async () => {
    const result = await client.getPlaceNoteFeed({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
});

Deno.test("/getPlaceCalendarEvents", async () => {
    const result = await client.getPlaceCalendarEvents({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
});

Deno.test("/getPlaceMetrics", async () => {
    const result = await client.getPlaceMetrics({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
});

Deno.test("/getPlaceCalenderEvents", async () => {
    const result = await client.getPlaceCalendarEvents({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
});

Deno.test("/getPlaceChats", async () => {
    const result = await client.getPlaceChats({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("/getPlaceCategoryScores", async () => {
    const result = await client.getPlaceCategoryScores({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
});

Deno.test("getPlaceEvent", async () => {
    const result = await client.getPlaceEvent({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("getRegion", async () => {
    const result = await client.getRegion({
        regionID: 1170,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.places.length > 0, true);
});

Deno.test("/getLocationsWithinBoundingBox", async () => {
    const result = await client.getLocationsWithinBoundingBox({
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
    const locationID = result[0].id;
    const location = await client.getLocation(locationID);
    if (location instanceof Error) fail(location.message);

    assertEquals(location.name, result[0].name);
    // @ts-ignore: openingHours is missing
    assertEquals(location.openingHours, result[0].openingHours);
});

Deno.test("getLocationTags", async () => {
    const result = await client.getLocationTags();
    if (result instanceof Error) {
        fail(result.message);
    }
    assertEquals(result.length > 0, true);
});

Deno.test("checkUsernameAvailability", async () => {
    {
        const result = await client.checkUsernameAvailability(randomString());
        if (result instanceof Error) {
            fail(result.message);
        }
        assertEquals(result, true);
    }
    {
        const result = await client.checkUsernameAvailability("123");
        if (result instanceof Error) {
            fail(result.message);
        }
        assertEquals(result, false);
    }
});

Deno.test("getAccount", async () => {
    const npub = "npub1le59glyc3r9zsddury0fu8wyqu69ckvj78fn4425m5xn9zd0zpdssjtd53";
    const result = await client.getAccount({
        npub,
    });
    if (result instanceof Error) {
        fail(result.message);
    }
    assertEquals(result.npub, npub);
});

Deno.test({
    name: "createAccount",
    // ignore: true,
    fn: async () => {
        {
            const result = await client.createAccount({
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
            const result = await client.createAccount({
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
            const result = await client.createAccount({
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
        const result = await client.login({
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
        const ok = await client.createAccount({
            email: `${randomString()}@email.com`,
            password,
            username,
        });
        if (ok instanceof Error) {
            fail(ok.message);
        }
        assertEquals(ok, true);
        // login with this account
        const result = await client.login({
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
    // @ts-ignore: test private
    const result = await client.getNotes({
        npub: "npub1le59glyc3r9zsddury0fu8wyqu69ckvj78fn4425m5xn9zd0zpdssjtd53",
        limit: 2,
        page: 0,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length == 2, true);

    const note = await client.getNote({ noteID: result[0].id });
    if (note instanceof Error) fail(note.message);
    if (note == undefined) fail(`${result[0].id} should be present`);

    // should be the same ntoe
    assertEquals(note.itself.id, result[0].id);
    assertEquals(note.itself.content, result[0].content);
    assertEquals(note.itself.sig, result[0].sig);
});

Deno.test("getIpInfo", async () => {
    const result = await client.getIpInfo();
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(JSON.stringify(result));
});

Deno.test("getLocationReviews", async () => {
    const result = await client.getLocationReviews({
        limit: 2,
        page: 0,
        locationId: 2313,
    });
    if (result instanceof Error) fail(result.message);
    console.log(result);
});

Deno.test("addressLookup", async () => {
    const result = await client.addressLookup({
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
    const result = await client.initiatePasswordReset({
        username: "albert",
    });
    if (result instanceof Error) fail(result.message);
    console.log(result);
});

Deno.test("resetPassword", async () => {
    // todo: this is not testing anything
    const result = (await client.resetPassword({
        password: "********",
        token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOjI2OTkxNCwiZXhwIjoxNzI1NjMzMzc0fQ.ihDjFSde5HS2qCbMquNy4qjwDPlFRAZx4km7tCF04kI",
    })) as ApiError;
    assertEquals(result.status, 404);
    assertEquals(result.message, "status 404, body record not found\n");
});

Deno.test("verifyEmail", async () => {
    const result = (await client.verifyEmail({
        token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOjI1NTU1NywiZXhwIjoxNzI0OTg5MDU4fQ.TH_YBHlVXkOhl2ZjPop-Xkt7tCgUi0aUMND-W0oD5rk",
    })) as ApiError;
    assertEquals(result.status, 403);
    assertEquals(result.message, "status 403, body Token doesn't exist\n");
});

Deno.test("interests", async () => {
    const event = await client.publishInterest(["food", "travel"]);
    if (event instanceof Error) {
        fail(event.message);
    }
    const res = await client.getInterestsOf(testSigner.publicKey);
    if (res instanceof Error) {
        fail(res.message);
    }
    assertEquals(res.event, event);
    assertEquals(res.interests, ["food", "travel"]);
});

Deno.test("follow & unfollow", async () => {
    const user1 = InMemoryAccountContext.Generate();
    const pub1 = PrivateKey.Generate().toPublicKey();
    const res = await client.loginNostr(user1);
    if (res instanceof Error) {
        fail(res.message);
    }

    const authedClient = Client.New({
        baseURL: client.url,
        relay_url: client.relay_url,
        getJwt: () => res.token,
        getNostrSigner: async () => user1,
    }) as Client;

    const follows = await authedClient.getMyFollowingPubkeys();
    if (follows instanceof Error) {
        fail(follows.message);
    }
    assertEquals(follows, new Set());

    const err = await authedClient.followPubkeys([pub1]);
    if (err instanceof Error) {
        fail(err.message);
    }
    {
        const follows = await authedClient.getMyFollowingPubkeys();
        if (follows instanceof Error) {
            fail(follows.message);
        }
        assertEquals(follows, new Set([pub1.hex]));
    }
    {
        const err = await authedClient.unfollowPubkey(pub1);
        if (err instanceof Error) {
            console.log(err);
            fail(err.message);
        }
    }
    {
        const follows = await authedClient.getMyFollowingPubkeys();
        if (follows instanceof Error) {
            fail(follows.message);
        }
        assertEquals(follows, new Set([]));
    }
});

Deno.test("follow & unfollow alternative api", async () => {
    const user1 = InMemoryAccountContext.Generate();
    const pub1 = PrivateKey.Generate().toPublicKey();
    const res = await client.loginNostr(user1);
    if (res instanceof Error) {
        fail(res.message);
    }

    const authedClient = Client.New({
        baseURL: client.url,
        relay_url: client.relay_url,
        getJwt: () => res.token,
        getNostrSigner: async () => user1,
    }) as Client;

    const follows = await authedClient.getMyFollowingPubkeys();
    if (follows instanceof Error) {
        fail(follows.message);
    }
    assertEquals(follows, new Set());

    const err = await authedClient.followPubkeys([pub1]);
    if (err instanceof Error) {
        fail(err.message);
    }
    {
        const follows = await authedClient.getMyFollowingPubkeys();
        if (follows instanceof Error) {
            fail(follows.message);
        }
        assertEquals(follows, new Set([pub1.hex]));

        const me = await authedClient.getMyProfile() as UserResolver;
        const following = await me.getFollowing() as UserResolver[];
        assertEquals(following.map((u) => u.pubkey.hex), [pub1.hex]);
    }
});

Deno.test("submitAmbassadorApplication", async (t) => {
    const receiver = InMemoryAccountContext.Generate();
    await t.step("missing contact methods", async () => {
        const event_sent = await client.submitAmbassadorApplication({
            place: "New York",
            comment: "I am a pro New Yorker",
            satlantis_pubkey: receiver.publicKey,
            nostr_only: false,
        }) as Error;
        assertEquals(event_sent.message, "need at least 1 contact method");
    });
    await t.step("nostr only", async () => {
        const event_sent = await client.submitAmbassadorApplication({
            place: "New York",
            comment: "I am a pro New Yorker",
            satlantis_pubkey: receiver.publicKey,
            nostr_only: true,
        }) as NostrEvent;
        const text = await receiver.decrypt(event_sent.pubkey, event_sent.content);
        assertEquals(
            text,
            `#Ambassador Application
Place: New York

I am a pro New Yorker

Contact: Nostr Only
`,
        );
    });
    await t.step("success", async () => {
        const event_sent = await client.submitAmbassadorApplication({
            place: "New York",
            comment: "I am a pro New Yorker",
            email: "test@whatever.io",
            telegram: "whoever",
            whatsapp: "who?",
            satlantis_pubkey: receiver.publicKey,
            nostr_only: false,
        });
        if (event_sent instanceof Error) {
            fail(event_sent.message);
        }
        const relay = SingleRelayConnection.New(client.relay_url) as SingleRelayConnection;
        const event_received = await relay.getEvent(event_sent.id) as NostrEvent;
        await relay.close();
        assertEquals(event_received, event_sent);

        const text = await receiver.decrypt(event_received.pubkey, event_received.content);
        assertEquals(
            text,
            `#Ambassador Application
Place: New York

I am a pro New Yorker

Email: test@whatever.io
Telegram: whoever
WhatsApp: who?
`,
        );
    });
});

export function randomString() {
    return String(Date.now());
}
