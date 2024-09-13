import {
    InMemoryAccountContext,
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

const url = new URL("https://api-dev.satlantis.io");
const clientNoAuth = Client.New({ baseURL: url });
if (clientNoAuth instanceof Error) {
    fail(clientNoAuth.message);
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
    const res = await clientNoAuth.loginNostr(signer);
    if (res instanceof Error) fail(res.message);
    assertEquals(res.account.npub, signer.publicKey.bech32());

    const client = Client.New({
        baseURL: "https://api-dev.satlantis.io",
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
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
    const res3 = await client.updateAccountFollowingList({ event });
    if (res3 instanceof Error) fail(res3.message);
    assertEquals(true, res3);
});

Deno.test("presign", async () => {
    const signer = InMemoryAccountContext.Generate();
    const res = await clientNoAuth.loginNostr(signer);
    if (res instanceof Error) fail(res.message);
    const client = Client.New({
        baseURL: "https://api-dev.satlantis.io",
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
    }) as Client;

    const result = await client.presign({
        filename: "1723171862272-robot.png",
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("post notes", async () => {
    const signer = InMemoryAccountContext.Generate();
    const res = await clientNoAuth.loginNostr(signer);
    if (res instanceof Error) fail(res.message);
    const client = Client.New({
        baseURL: "https://api-dev.satlantis.io",
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
    }) as Client;
    {
        const root_event = await prepareNostrEvent(signer, {
            content: "test reaction",
            kind: NostrKind.REACTION,
        }) as NostrEvent;
        const rootNote = await client.postNote({
            placeId: 23949,
            accountId: res.account.id,
            event: root_event,
            noteType: NoteType.BASIC,
        });
        if (rootNote instanceof Error) fail(rootNote.message);
        console.log(rootNote);
        assertEquals(rootNote.event.nostrId, root_event.id);

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
    }) as Client;
    {
        const originalPlace = await client.getPlace({ osmRef: "R296561" });
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

        let updatedPlace = await client.getPlace({ osmRef: originalPlace.osmRef });
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

        updatedPlace = await client.getPlace({ osmRef: originalPlace.osmRef });
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
            email: `${randomString()}@email.com`,
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
            baseURL: url,
            getJwt: () => login.token,
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
                const res = await loginNostr(url)(signer);
                if (res instanceof Error) fail(res.message);

                const client = Client.New({
                    baseURL: url,
                    getJwt: () => res.token,
                    getNostrSigner: async () => signer,
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

Deno.test("getInterests", async () => {
    const signer = InMemoryAccountContext.Generate();
    const res = await clientNoAuth.loginNostr(signer);
    if (res instanceof Error) fail(res.message);

    const client = Client.New({
        baseURL: "https://api-dev.satlantis.io",
        getJwt: () => res.token,
        getNostrSigner: async () => signer,
    }) as Client;

    const interests = await client.getInterests();
    if (interests instanceof Error) fail(interests.message);
    assertEquals(interests.length > 0, true);
});
