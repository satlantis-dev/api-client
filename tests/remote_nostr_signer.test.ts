import { PrivateKey } from "https://jsr.io/@blowater/nostr-sdk/0.0.16/key.ts";
import { InMemoryAccountContext, type NostrEvent, NostrKind, verifyEvent } from "@blowater/nostr-sdk";
import { assertEquals } from "jsr:@std/assert@0.226.0/assert-equals";
import { fail } from "jsr:@std/assert@0.226.0/fail";
import { Client, loginNostr } from "../sdk.ts";
import { randomString } from "./public_api.test.ts";

const url = new URL("https://api-dev.satlantis.io");
const clientNoAuth = Client.New({ baseURL: url });
if (clientNoAuth instanceof Error) {
    fail(clientNoAuth.message);
}

Deno.test({
    name: "signEvent",
    // ignore: true,
    fn: async (t) => {
        const result = await clientNoAuth.createAccount({
            email: `${randomString()}@email.com`,
            password: "simple",
            username: "hi",
        });
        if (result instanceof Error) fail(result.message);

        const login = await clientNoAuth.login({
            password: "simple",
            username: "hi",
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

Deno.test("encryptEvent", async () => {
});
