import { InMemoryAccountContext, NostrKind, prepareNostrEvent } from "@blowater/nostr-sdk";
import { fail } from "jsr:@std/assert@0.226.0/fail";
import { Client } from "../sdk.ts";
import { assertEquals } from "jsr:@std/assert@0.226.0/assert-equals";
import { AccountPlaceRoleTypeEnum } from "../models/account.ts";

const clientNoAuth = Client.New({ baseURL: "https://api-dev.satlantis.io" });
if (clientNoAuth instanceof Error) {
    fail(clientNoAuth.message);
}

Deno.test("AccountRole", async () => {
    const signer = InMemoryAccountContext.Generate();
    {
        // test fot the failure cases
        const res = await clientNoAuth.removeAccountRole({
            placeId: 23949,
            type: AccountPlaceRoleTypeEnum.AMBASSADOR,
        }) as Error;
        assertEquals(res.message, "jwt token is empty");
    }

    // login with a new nostr key
    const res = await clientNoAuth.loginNostr(signer);
    if (res instanceof Error) fail(res.message);
    assertEquals(res.account.npub, signer.publicKey.bech32());

    const client = Client.New({
        baseURL: "https://api-dev.satlantis.io",
        getJwt: () => res.token,
        getNostrSigner: () => signer,
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
        tags: [
            ["p", signer.publicKey.hex],
        ],
    });
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
        getNostrSigner: () => signer,
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
