import {
    getTags,
    InMemoryAccountContext,
    newURL,
    type NostrEvent,
    NostrKind,
    prepareNostrEvent,
    PrivateKey,
    SingleRelayConnection,
    verifyEvent,
} from "@blowater/nostr-sdk";
import { assertEquals } from "jsr:@std/assert@0.226.0/assert-equals";
import { fail } from "jsr:@std/assert@0.226.0/fail";

import { AccountPlaceRoleTypeEnum } from "../models/account.ts";
import { Client, loginNostr, NoteType } from "../sdk.ts";
import { randomString } from "./public_api.test.ts";
import { UserResolver } from "../resolvers/user.ts";

import { nip04Encrypt } from "../api/nostr_event.ts";
import { assertNotEquals } from "@std/assert/not-equals";
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
if (res instanceof Error) {
    throw res;
}
const client = Client.New({
    baseURL: rest_url,
    relay_url,
    getJwt: () => res.token,
    getNostrSigner: async () => signer,
    aws_cdn_url,
});
if (client instanceof Error) {
    fail(client.message);
}

Deno.test("AccountRole", async () => {
    const signer = InMemoryAccountContext.Generate();
    {
        // test fot the failure cases
        const res = (await clientNoAuth.removeAccountRole({
            placeId: 23949,
            type: AccountPlaceRoleTypeEnum.AMBASSADOR,
        })) as Error;
        assertEquals(res.message, "jwt token is empty");
    }

    // login with a new nostr key
    const res = await clientNoAuth.loginNostr(signer, { name: "test" });
    if (res instanceof Error) fail(res.message);
    assertEquals(res.account.npub, signer.publicKey.bech32());

    const client = Client.New({
        baseURL: rest_url,
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
        relay_url,
        aws_cdn_url,
    }) as Client;

    // join the place as a follower
    const res1 = await client.addAccountRole({
        placeId: 23949,
        type: AccountPlaceRoleTypeEnum.FOLLOWER,
    });
    if (res1 instanceof Error) fail(res1.message);

    // leave the place
    const res2 = await client.removeAccountRole({
        placeId: 23949,
        type: AccountPlaceRoleTypeEnum.FOLLOWER,
    });
    if (res2 instanceof Error) fail(res2.message);
    console.log(res2);

    // update contact list
    const event = (await prepareNostrEvent(signer, {
        kind: NostrKind.CONTACTS,
        content: "",
        tags: [["p", signer.publicKey.hex]],
    })) as NostrEvent<NostrKind.CONTACTS>;
    // @ts-ignore: use private
    const res3 = await client.updateAccountFollowingList({ event });
    if (res3 instanceof Error) fail(res3.message);
    assertEquals(true, res3);
});

Deno.test("upload file", async () => {
    const signer = InMemoryAccountContext.Generate();
    const res = await clientNoAuth.loginNostr(signer, { name: "test" });
    if (res instanceof Error) fail(res.message);

    const client = Client.New({
        baseURL: rest_url,
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
        relay_url,
        aws_cdn_url,
    }) as Client;

    const result = await client.uploadFile({
        file: new File(["test content"], "test-upload-file.txt"),
    });
    if (result instanceof Error) {
        fail(result.message);
    }

    const file = await fetch(result);
    if (!file.ok) {
        fail(await file.text());
    }

    assertEquals(await file.text(), "test content");
});

Deno.test("post notes", async () => {
    const signer = InMemoryAccountContext.Generate();
    const res = await clientNoAuth.loginNostr(signer, { name: "test" });
    if (res instanceof Error) fail(res.message);
    const client = Client.New({
        baseURL: rest_url,
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
        relay_url,
        aws_cdn_url,
    }) as Client;
    {
        const root_event = (await prepareNostrEvent(signer, {
            content: "test reaction",
            kind: NostrKind.REACTION,
        })) as NostrEvent;
        const rootNote = await client._postNote({
            placeId: 23949,
            accountId: res.account.id,
            event: root_event,
            noteType: NoteType.BASIC,
        });
        if (rootNote instanceof Error) {
            fail(rootNote.message);
        }
        console.log(rootNote);
        assertEquals(rootNote.nostrId, root_event.id);

        const reaction_event = (await prepareNostrEvent(signer, {
            content: "test reaction",
            kind: NostrKind.REACTION,
        })) as NostrEvent;
        const result = await client.postReaction({
            accountId: res.account.id,
            event: reaction_event,
            noteId: rootNote.id,
            noteType: NoteType.REACTION,
            parentId: rootNote.id,
        });
        if (result instanceof Error) {
            fail(result.message);
        }
        console.log(result);
        assertEquals(result.noteId, rootNote.id);
    }
});

Deno.test("update place", async () => {
    const signer = InMemoryAccountContext.Generate();
    const res = await clientNoAuth.loginNostr(signer, { name: "test" });
    if (res instanceof Error) fail(res.message);
    const client = Client.New({
        baseURL: rest_url,
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
        relay_url,
        aws_cdn_url,
    }) as Client;
    {
        const originalPlace = await client.getPlaceByOsmRef({ osmRef: "R296561" });
        if (originalPlace instanceof Error) {
            fail(originalPlace.message);
        }

        let result = await client.updatePlace({
            id: originalPlace.id,
            name: "RandomTestName",
        });
        if (result instanceof Error) {
            fail(result.message);
        }

        let updatedPlace = await client.getPlaceByOsmRef({
            osmRef: originalPlace.osmRef,
        });
        if (updatedPlace instanceof Error) {
            fail(updatedPlace.message);
        }
        assertEquals(updatedPlace.name, "RandomTestName");

        result = await client.updatePlace({
            id: originalPlace.id,
            name: originalPlace.name,
        });
        if (result instanceof Error) {
            fail(result.message);
        }

        updatedPlace = await client.getPlaceByOsmRef({
            osmRef: originalPlace.osmRef,
        });
        if (updatedPlace instanceof Error) {
            fail(updatedPlace.message);
        }
        assertEquals(updatedPlace, originalPlace);
    }
});

Deno.test({
    name: "signEvent",
    // ignore: true,
    fn: async (t) => {
        const password = randomString();
        const username = randomString();
        const result = await clientNoAuth.createAccount({
            email: `albert+${randomString()}@satlantis.io`,
            password,
            username,
        });
        if (result instanceof Error) fail(result.message);

        const login = await clientNoAuth.login({
            password,
            username,
        });
        if (login instanceof Error) fail(login.message);
        if (login == undefined || login == "invalid password") fail("wrong");

        const client = Client.New({
            baseURL: rest_url,
            getJwt: () => login.token,
            relay_url,
            aws_cdn_url,
        }) as Client;

        await t.step("sign the event with a wrong pubkey", async () => {
            const signed = await client.signEvent({
                created_at: Math.floor(Date.now() / 1000),
                kind: NostrKind.CONTACTS,
                pubkey: PrivateKey.Generate().toPublicKey().hex,
                tags: [],
                content: "",
            });
            if (signed instanceof Error) {
                fail(signed.message);
            }
            assertEquals(signed, {
                type: 401,
                data: "status 401, body Event pubkey does not match account pubkey\n",
            });
        });
        await t.step("sign the event with an existing account", async () => {
            const signed = await client.signEvent({
                created_at: Math.floor(Date.now() / 1000),
                kind: NostrKind.CONTACTS,
                pubkey: login.account.pubKey,
                tags: [],
                content: "",
            });
            if (signed instanceof Error) {
                fail(signed.message);
            }
            assertEquals(signed.type, true);
            assertEquals(await verifyEvent(signed.data as NostrEvent), true);
        });

        await t.step({
            name: "sign the event with a new pubkey that has not been registerred in backend",
            ignore: true,
            fn: async () => {
                const signer = InMemoryAccountContext.Generate();
                const res = await loginNostr(rest_url)(signer, { name: "test" });
                if (res instanceof Error) fail(res.message);

                const client = Client.New({
                    baseURL: rest_url,
                    getJwt: () => res.token,
                    getNostrSigner: async () => signer,
                    relay_url,
                    aws_cdn_url,
                }) as Client;

                const signed = await client.signEvent({
                    created_at: Math.floor(Date.now() / 1000),
                    kind: NostrKind.CONTACTS,
                    pubkey: signer.publicKey.hex,
                    tags: [],
                    content: "",
                });
                if (signed instanceof Error) {
                    fail(signed.message);
                }
                console.log(signed);
            },
        });
    },
});

Deno.test("nip04Encrypt", async () => {
    const text = "This is a test";
    const receiver = InMemoryAccountContext.Generate();
    const password = randomString();
    const username = randomString();
    const result = await clientNoAuth.createAccount({
        email: `albert+${randomString()}@satlantis.io`,
        password,
        username,
    });
    if (result instanceof Error) fail(result.message);

    const login = await clientNoAuth.login({
        password,
        username,
    });
    if (login instanceof Error) fail(login.message);
    if (login == undefined || login == "invalid password") fail("wrong");

    const url = newURL(rest_url);
    if (url instanceof Error) {
        fail(url.message);
    }

    const ret = await nip04Encrypt(
        url,
        () => login.token,
    )({
        pubKey: receiver.publicKey.hex,
        plaintext: text,
    });
    if (ret instanceof Error) {
        fail(ret.message);
    }

    const decryptText = await receiver.decrypt(login.account.pubKey, ret);
    assertEquals(decryptText, text);
});

Deno.test("getInterests", async () => {
    const signer = InMemoryAccountContext.Generate();
    const res = await clientNoAuth.loginNostr(signer, { name: "test" });
    if (res instanceof Error) fail(res.message);

    const client = Client.New({
        baseURL: rest_url,
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
        relay_url,
        aws_cdn_url,
    }) as Client;

    const interests = await client.getInterests();
    if (interests instanceof Error) fail(interests.message);
    assertEquals(interests.length > 0, true);
    // https://linear.app/sat-lantis/issue/SAT-1115/remove-default-from-interests-list
    assertEquals(
        interests.find((i) => i.name == "Default"),
        undefined,
    );
});

// TODO: unfinished
/*
Deno.test("update location", async () => {
    const signer = InMemoryAccountContext.Generate();
    const res = await clientNoAuth.loginNostr(signer, { name: "test" });
    if (res instanceof Error) fail(res.message);

    // https://www.dev.satlantis.io/location/2249
    const locationId = 2249;

    const res2 = await client.updateLocation({
        locationId,
        location: {
            bio: "test",
            websiteUrl: "https://test.com",
            openingHours: {
                monday: "string",
                tuesday: "string",
                wednesday: "string",
                thursday: "string",
                friday: "string",
                saturday: "string",
                sunday: "string",
            },
            phone: "+1 (708)11110349",
            email: "test@test.com",
        },
    });
    //console.log(res2);
    // if (res2 instanceof Error) fail(res2.message);
});
*/

Deno.test("calendar events", async () => {
    const signer = InMemoryAccountContext.Generate();

    const res = await clientNoAuth.loginNostr(signer, { name: "test" });
    if (res instanceof Error) fail(res.message);

    const account = res.account;
    const client = Client.New({
        baseURL: rest_url,
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
        relay_url,
        aws_cdn_url,
    }) as Client;

    {
        const res = await client.createCalendarEvent({
            placeId: 23751,
            calendarEventType: "concert",
            description: "a concert",
            endDate: new Date(Date.now() + 1000 * 120),
            geoHash: "rwerwr",
            imageURL: "",
            location: "somewhere",
            placeATag: "",
            startDate: new Date(Date.now() + 1000 * 60),
            timezone: "",
            title: "song",
            url: "",
            summary: "this is from integration tests of api-client",
            website: "https://website.satlantis.io",
        });
        if (res instanceof Error) {
            fail(res.message);
        }
        assertNotEquals(res.postResult.calendarEvent.id, 0);
        const res2 = await client.postCalendarEventRSVP({
            response: "accepted",
            calendarEvent: {
                accountId: account.id,
                dtag: getTags(res.event).d as string,
                calendarEventId: res.postResult.calendarEvent.id,
                pubkey: account.pubKey,
            },
        });
        if (res2 instanceof Error) {
            fail(res2.message);
        }

        const res3 = await client.updateCalendarEvent({
            dTag: res.postResult.calendarEvent.dtag,
            calendarEventId: res.postResult.calendarEvent.id,
            placeId: 23751,
            calendarEventType: "2concert",
            description: "2a concert",
            endDate: new Date(Date.now() + 1000 * 120),
            geoHash: "2rwerwr",
            imageURL: "",
            location: "2somewhere",
            placeATag: "",
            startDate: new Date(Date.now() + 1000 * 60),
            timezone: "",
            title: "2song",
            url: "",
            summary: "this is from integration tests of api-client",
            website: "2website.satlantis.io",
        });
        if (res3 instanceof Error) {
            fail(res3.message);
        }
    }
});

Deno.test("getUserProfile & updateUserProfile", async (t) => {
    // setup
    const signer = InMemoryAccountContext.Generate();

    const res = await clientNoAuth.loginNostr(signer, { name: "test" });
    if (res instanceof Error) fail(res.message);

    // test
    {
        const p1 = client.resolver.getUser(signer.publicKey);
        const p2 = client.getMyProfile();
        const profile1 = (await p1) as UserResolver;
        const profile2 = (await p2) as UserResolver;

        assertEquals(profile1.metaData, profile2.metaData);

        await client.updateMyProfile({
            name: "this is a test",
        });
        const p3 = (await client.getMyProfile()) as UserResolver;
        const expected = new UserResolver(
            client,
            signer.publicKey,
            false,
            false,
            "",
            {
                name: "this is a test",
                about: "",
                banner: "",
                displayName: "this is a test",
                lud06: "",
                lud16: "",
                picture: "",
                website: "",
            },
        );

        assertEquals(p3.metaData, expected.metaData);

        assertEquals(await p3.getNip05(), "");
        assertEquals(await p3.getIsBusiness(), false);
        assertEquals(p3.isBusiness, false);

        await t.step("become a business", async () => {
            // @ts-ignore: use private
            const err = await client.becomeBusinessAccount();
            if (err instanceof Error) {
                fail(err.message);
            }

            assertEquals(p3.isBusiness, false);
            assertEquals(await p3.getIsBusiness(), true);
            assertEquals(p3.isBusiness, true);
        });
    }
});

Deno.test("claim location", async (t) => {
    // https://www.dev.satlantis.io/location/1998
    const res = await client.claimLocation({ locationId: 1998 });
    if (res instanceof Error) fail(res.message);
    // // the lenght of the code might not be part of the API
    // // put it here just to be safe
    // // so that when it changes, we will know
    assertEquals(res.code.length, "wA2tjNpcGvNED7YoSpbF".length);

    await t.step("should be successful", async () => {
        const res2 = await client.proveLocationClaim({
            locationId: 1998,
            referredBy: "",
            url: "https://posts.gle/xPnjpX",
        });
        // todo: blocked
        console.log(res2);
    });
});

Deno.test("submitAmbassadorApplication", async (t) => {
    const receiver = InMemoryAccountContext.Generate();

    const place = await client.getPlaceByOsmRef({
        osmRef: "R8421413",
    });
    if (place instanceof Error) fail(place.message);

    await t.step("missing contact methods", async () => {
        const event_sent = (await client.submitAmbassadorApplication({
            place: place.name,
            comment: "I am a pro New Yorker",
            satlantis_pubkey: receiver.publicKey,
            nostr_only: false,
            countryCode: place.country.code,
        })) as Error;
        assertEquals(event_sent.message, "need at least 1 contact method");
    });
    await t.step("nostr only", async () => {
        const event_sent = await client.submitAmbassadorApplication({
            place: place.name,
            comment: "I am a pro New Yorker",
            satlantis_pubkey: receiver.publicKey,
            nostr_only: true,
            countryCode: place.country.code,
        });
        if (event_sent instanceof Error) {
            fail(event_sent.message);
        }
        const text = await receiver.decrypt(event_sent.pubkey, event_sent.content);
        assertEquals(
            text,
            `#Ambassador Application
Place: Funchal

I am a pro New Yorker

Contact: Nostr Only
`,
        );
    });
    await t.step("success", async () => {
        const event_sent = await client.submitAmbassadorApplication({
            place: place.name,
            comment: "I am a pro New Yorker",
            email: "test@whatever.io",
            telegram: "whoever",
            whatsapp: "who?",
            satlantis_pubkey: receiver.publicKey,
            nostr_only: false,
            countryCode: place.country.code,
        });
        if (event_sent instanceof Error) {
            fail(event_sent.message);
        }
        const relay = SingleRelayConnection.New(
            client.relay_url,
        ) as SingleRelayConnection;
        const event_received = (await relay.getEvent(event_sent.id)) as NostrEvent;
        await relay.close();
        assertEquals(event_received, event_sent);

        const text = await receiver.decrypt(
            event_received.pubkey,
            event_received.content,
        );
        assertEquals(
            text,
            `#Ambassador Application
Place: Funchal

I am a pro New Yorker

Email: test@whatever.io
Telegram: whoever
WhatsApp: who?
`,
        );
    });
});

Deno.test("getAccountsBySearch", async (t) => {
    await t.step("should find accounts with basic search patterns", async (t) => {
        const testCases = [
            { name: "Exact match with lowercase", query: "satlantis" },
            { name: "Exact match with proper case", query: "Satlantis" },
            { name: "Partial match with prefix", query: "sat" },
        ];

        for (const tc of testCases) {
            await t.step(tc.name, async () => {
                const res2 = await client.getAccountsBySearch({
                    username: tc.query,
                });
                if (res2 instanceof Error) {
                    fail(res2.message);
                }
                assertEquals(res2.length > 0, true);
            });
        }
    });

    await t.step("should handle invalid username patterns", async (t) => {
        const testCases = [
            { name: "Invalid username with number suffix", query: "satlantis1" },
            { name: "Invalid username with number prefix", query: "1satlantis" },
            { name: "Invalid username with number in middle", query: "sat1antis" },
        ];

        for (const tc of testCases) {
            await t.step(tc.name, async () => {
                const res2 = await client.getAccountsBySearch({
                    username: tc.query,
                });
                if (res2 instanceof Error) {
                    fail(res2.message);
                }
                assertEquals(res2.length, 0);
            });
        }
    });

    await t.step("should find known community members", async (t) => {
        // Reference: https://api-dev.satlantis.io/getPeopleOfPlace/23090
        const testCases = [
            "jeff",
            "satoshi",
            "jason",
        ];

        for (const tc of testCases) {
            await t.step(`should find user "${tc}"`, async () => {
                const res2 = await client.getAccountsBySearch({
                    username: tc,
                });
                if (res2 instanceof Error) {
                    fail(res2.message);
                }
                assertEquals(res2.length > 0, true);
            });
        }
    });
});
