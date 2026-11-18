import { assertEquals, assertStrictEquals } from "@std/assert";
import { InMemoryAccountContext, type Signer } from "@blowater/nostr-sdk";
import { loginNostr } from "../api/login.ts";

Deno.test("loginNostr returns the signer's error without calling the backend", async () => {
    const signError = new Error("window.nostr call cancelled");
    const signer: Signer = {
        publicKey: InMemoryAccountContext.Generate().publicKey,
        signEvent: async () => signError,
    };

    const originalFetch = globalThis.fetch;
    let fetchCalls = 0;
    globalThis.fetch = async () => {
        fetchCalls++;
        return new Response("{}", { status: 200 });
    };
    try {
        const result = await loginNostr(new URL("https://example.invalid"))(signer);
        assertStrictEquals(result, signError);
        assertEquals(fetchCalls, 0);
    } finally {
        globalThis.fetch = originalFetch;
    }
});
