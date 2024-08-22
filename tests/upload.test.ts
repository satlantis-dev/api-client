import { InMemoryAccountContext } from "@blowater/nostr-sdk";
import { Client } from "../sdk.ts";
import { loginNostr } from "../api/login.ts";
import { sign } from "jsr:@noble/secp256k1@2.1.0";
import { fail } from "@std/assert";

const url = new URL("https://api-dev.satlantis.io")

Deno.test("upload images", async () => {
    const signer = InMemoryAccountContext.Generate();
    const jwt = await loginNostr(url)(signer);
    if(jwt instanceof Error) fail(jwt.message)

    const client = Client.New({
        baseURL: url,
        getJwt: () => jwt.token,
        getNostrSigner: async () => signer,
    }) as Client;

    const res = await client.uploadFileS3({file: new File([], "test"), filename: "test"})
    console.log(res)
})
