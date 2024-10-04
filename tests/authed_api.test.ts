import {
    getTags,
    InMemoryAccountContext,
    newURL,
    type NostrEvent,
    NostrKind,
    prepareNostrEvent,
    PrivateKey,
    verifyEvent,
} from "@blowater/nostr-sdk";
import { assertEquals } from "jsr:@std/assert@0.226.0/assert-equals";
import { fail } from "jsr:@std/assert@0.226.0/fail";

import { AccountPlaceRoleTypeEnum } from "../models/account.ts";
import { Client, loginNostr, NoteType } from "../sdk.ts";
import { randomString } from "./public_api.test.ts";
import { CalendarEventType } from "../models/calendar.ts";
import { UserResolver } from "../resolvers/user.ts";
import type { ApiError } from "../helpers/_helper.ts";
import { nip04Encrypt } from "../api/nostr_event.ts";

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
if (res instanceof Error) {
    throw res;
}
const client = Client.New({
    baseURL: testURL,
    relay_url,
    getJwt: () => res.token,
    getNostrSigner: async () => signer,
}) as Client;

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
    const res = await clientNoAuth.loginNostr(signer);
    if (res instanceof Error) fail(res.message);
    assertEquals(res.account.npub, signer.publicKey.bech32());

    const client = Client.New({
        baseURL: "https://api-dev.satlantis.io",
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
        relay_url,
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
    const event = await prepareNostrEvent(signer, {
        kind: NostrKind.CONTACTS,
        content: "",
        tags: [["p", signer.publicKey.hex]],
    }) as NostrEvent<NostrKind.CONTACTS>;
    // @ts-ignore: use private
    const res3 = await client.updateAccountFollowingList({ event });
    if (res3 instanceof Error) fail(res3.message);
    assertEquals(true, res3);
});

Deno.test("upload file", async () => {
    const signer = InMemoryAccountContext.Generate();
    const res = await clientNoAuth.loginNostr(signer);
    if (res instanceof Error) fail(res.message);

    const client = Client.New({
        baseURL: testURL,
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
        relay_url,
    }) as Client;

    const result = await client.uploadFile({
        file: new File(
            ["test content"],
            "test-upload-file.txt",
        ),
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
    const res = await clientNoAuth.loginNostr(signer);
    if (res instanceof Error) fail(res.message);
    const client = Client.New({
        baseURL: "https://api-dev.satlantis.io",
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
        relay_url,
    }) as Client;
    {
        const root_event = await prepareNostrEvent(signer, {
            content: "test reaction",
            kind: NostrKind.REACTION,
        }) as NostrEvent;
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

        const reaction_event = await prepareNostrEvent(signer, {
            content: "test reaction",
            kind: NostrKind.REACTION,
        }) as NostrEvent;
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
    const res = await clientNoAuth.loginNostr(signer);
    if (res instanceof Error) fail(res.message);
    const client = Client.New({
        baseURL: "https://api-dev.satlantis.io",
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
        relay_url,
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

        let updatedPlace = await client.getPlaceByOsmRef({ osmRef: originalPlace.osmRef });
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

        updatedPlace = await client.getPlaceByOsmRef({ osmRef: originalPlace.osmRef });
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
            baseURL: testURL,
            getJwt: () => login.token,
            relay_url,
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
                const res = await loginNostr(testURL)(signer);
                if (res instanceof Error) fail(res.message);

                const client = Client.New({
                    baseURL: testURL,
                    getJwt: () => res.token,
                    getNostrSigner: async () => signer,
                    relay_url,
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

    const url = newURL(testURL);
    if (url instanceof Error) {
        fail(url.message);
    }

    const ret = await nip04Encrypt(url, () => login.token)({
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
    const res = await clientNoAuth.loginNostr(signer);
    if (res instanceof Error) fail(res.message);

    const client = Client.New({
        baseURL: "https://api-dev.satlantis.io",
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
        relay_url,
    }) as Client;

    const interests = await client.getInterests();
    if (interests instanceof Error) fail(interests.message);
    assertEquals(interests.length > 0, true);
});

Deno.test("calendar events", async () => {
    const signer = InMemoryAccountContext.Generate();

    const res = await clientNoAuth.loginNostr(signer);
    if (res instanceof Error) fail(res.message);

    const account = res.account;
    const client = Client.New({
        baseURL: "https://api-dev.satlantis.io",
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
        relay_url,
    }) as Client;

    {
        const res = await client.createCalendarEvent({
            placeID: 1775,
            calendarEventType: CalendarEventType.Concert,
            description: "a concert",
            endDate: "end date",
            geoHash: "rwerwr",
            imageURL: "",
            location: "somewhere",
            placeATag: "",
            startDate: "",
            timezone: "",
            title: "song",
            url: "",
            summary: "this is from integration tests of api-client",
        });
        if (res instanceof Error) {
            fail(res.message);
        }
        const res2 = await client.postCalendarEventRSVP({
            response: "accepted",
            calendarEvent: {
                accountId: account.id,
                dtag: getTags(res.event).d as string,
                // note: {
                //     event: res.event,
                // },
                calendarEventId: res.postResult.calendarEventId,
                pubkey: account.pubKey,
            },
        });
        if (res2 instanceof Error) {
            fail(res2.message);
        }
    }
});

Deno.test("getUserProfile & updateUserProfile", async (t) => {
    // setup
    const signer = InMemoryAccountContext.Generate();

    const res = await clientNoAuth.loginNostr(signer);
    if (res instanceof Error) fail(res.message);

    const client = Client.New({
        baseURL: "https://api-dev.satlantis.io",
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
        relay_url,
    }) as Client;

    // test
    {
        const p1 = client.getUserProfile(signer.publicKey);
        const p2 = client.getMyProfile();
        const profile1 = await p1 as UserResolver;
        const profile2 = await p2 as UserResolver;

        assertEquals(profile1.metaData, profile2.metaData);
        assertEquals(profile1.metaData, new UserResolver(client, signer.publicKey).metaData);

        await client.updateMyProfile({
            name: "this is a test",
        });
        const p3 = await client.getMyProfile() as UserResolver;
        const expected = new UserResolver(client, signer.publicKey, {
            name: "this is a test",
        });

        assertEquals(
            p3.metaData,
            expected.metaData,
        );

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

Deno.test("claim location", async () => {
    // https://www.dev.satlantis.io/location/1655
    // const res = await client.claimLocation({ locationId: 1655 });
    // if (res instanceof Error) fail(res.message);
    // // the lenght of the code might not be part of the API
    // // put it here just to be safe
    // // so that when it changes, we will know
    // assertEquals(res.code.length, "wA2tjNpcGvNED7YoSpbF".length);

    // We can't get a valid google url in the test,
    // so we only assert the failure case here
    // {
    //     const res2 = await client.proveLocationClaim({
    //         locationId: 1775,
    //         referredBy: "",
    //         url: "https://posts.gle/xPnjpX",
    //     }) as ApiError;
    //     assertEquals(res2.message, "status 400, body LocationSetEvent is required\n");
    // }
    {
        const res2 = await client.proveLocationClaim({
            locationId: 1775,
            referredBy: "",
            url: "https://posts.gle/xPnjpX",
        }) as ApiError;
        // todo: blocked
        console.log(res2);
        // assertEquals(res2.message, "status 400, body LocationSetEvent is required\n");
    }
});
