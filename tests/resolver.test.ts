import { assertEquals, fail } from "@std/assert";
import { Client } from "../sdk.ts";
import { InMemoryAccountContext } from "@blowater/nostr-sdk";

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

Deno.test("getNotesOf", async () => {
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
    }

    const result = await client.getNotesOf({
        pubkey: signer.publicKey,
        page: {
            limit: 2,
            sort: "ASC",
        },
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    {
        const data = await Array.fromAsync(result);
        assertEquals(data.length == 2, true);
    }
});
