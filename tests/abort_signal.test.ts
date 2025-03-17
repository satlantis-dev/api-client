import { assertEquals, assertInstanceOf, fail } from "@std/assert";
import { Client } from "../sdk.ts";
import { InMemoryAccountContext } from "@blowater/nostr-sdk";
import { aws_cdn_url, relay_url, rest_url } from "./urls.ts";

const setupAuthClient = async () => {
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

    return client;
};

const isAbortError = (error: unknown): boolean => {
    if (error instanceof Error) {
        return error.name === "AbortError" || error.message.includes("aborted");
    }
    return false;
};

Deno.test("AbortSignal - getAccountsBySearch", async () => {
    const client = await setupAuthClient();

    const controller = new AbortController();
    const { signal } = controller;

    const requestPromise = client.getAccountsBySearch({
        username: "test",
        limit: 10,
        page: 0,
    }, { signal });

    controller.abort();

    try {
        const result = await requestPromise;
        if (result instanceof Error) {
            assertEquals(isAbortError(result), true, "Expected an abort error");
        }
    } catch (error: unknown) {
        assertEquals(isAbortError(error), true, "Expected an abort error");
    }
});

Deno.test("AbortSignal - getAccountsBySearch with timeout", async () => {
    const client = await setupAuthClient();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 100);

    try {
        const result = await client.getAccountsBySearch({
            username: "test",
            limit: 10,
            page: 0,
        }, { signal: controller.signal });

        clearTimeout(timeoutId);
        if (!(result instanceof Error)) {
            assertInstanceOf(result, Array);
        }
    } catch (error: unknown) {
        clearTimeout(timeoutId);
        assertEquals(isAbortError(error), true, "Expected an abort error");
    }
});

Deno.test("AbortSignal - race condition demonstration", async () => {
    const client = await setupAuthClient();

    const controller1 = new AbortController();
    const controller2 = new AbortController();

    const request1 = client.getAccountsBySearch({
        username: "test1",
        limit: 10,
        page: 0,
    }, { signal: controller1.signal });

    const request2 = client.getAccountsBySearch({
        username: "test2",
        limit: 10,
        page: 0,
    }, { signal: controller2.signal });

    controller1.abort();

    const [result1, result2] = await Promise.all([
        request1.catch((error: unknown) => error),
        request2,
    ]);

    assertEquals(
        result1 instanceof Error && isAbortError(result1),
        true,
        "First request should have been aborted",
    );
    assertEquals(
        result1 instanceof Error && isAbortError(result1),
        true,
        "First request should have been aborted",
    );

    if (result2 instanceof Error) {
        assertEquals(
            isAbortError(result2),
            false,
            "Second request should not have been aborted",
        );
    }
});
