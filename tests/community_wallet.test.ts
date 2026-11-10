import { assertEquals } from "@std/assert";
import {
    estimateCommunityPaymentFee,
    getCommunityTransactionDetails,
    getCommunityTransactionHistory,
    getCommunityWallets,
    sendCommunityPayment,
} from "../api/secure/community_wallet.ts";

function stubFetch(payload: unknown) {
    const calls: { url: string; method: string; body?: string; auth: string | null }[] = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => {
        calls.push({
            url: String(input instanceof Request ? input.url : input),
            method: init?.method ?? "GET",
            body: typeof init?.body === "string" ? init.body : undefined,
            auth: new Headers(init?.headers).get("Authorization"),
        });
        return Promise.resolve(
            new Response(JSON.stringify(payload), {
                status: 200,
                headers: { "content-type": "application/json" },
            }),
        );
    }) as typeof fetch;
    return { calls, restore: () => (globalThis.fetch = originalFetch) };
}

const baseURL = new URL("https://api.example.com");
const getJwt = () => "jwt";

Deno.test("community wallet: routes target the community's wallet with the JWT", async () => {
    const { calls, restore } = stubFetch({});
    try {
        await getCommunityWallets(baseURL, getJwt)();
        await sendCommunityPayment(baseURL, getJwt)(7, "friend@example.com", 100, "Thanks");
        await estimateCommunityPaymentFee(baseURL, getJwt)(7, "friend@example.com", 100);
        await getCommunityTransactionDetails(baseURL, getJwt)(7, 42);
    } finally {
        restore();
    }
    assertEquals(calls.map((call) => `${call.method} ${call.url}`), [
        "GET https://api.example.com/secure/me/community-wallets",
        "POST https://api.example.com/secure/communities/7/wallet/send",
        "POST https://api.example.com/secure/communities/7/wallet/send/estimate-fee",
        "GET https://api.example.com/secure/communities/7/wallet/transactions/42",
    ]);
    assertEquals(JSON.parse(calls[1].body!), {
        destination: "friend@example.com",
        amount: 100,
        memo: "Thanks",
    });
    assertEquals(JSON.parse(calls[2].body!), { destination: "friend@example.com", amount: 100 });
    assertEquals(calls.every((call) => call.auth === "Bearer jwt"), true);
});

Deno.test("community wallet: history uses the community filter names", async () => {
    const { calls, restore } = stubFetch({ transactions: [] });
    try {
        await getCommunityTransactionHistory(baseURL, getJwt)(7, 2, 50, "received");
        await getCommunityTransactionHistory(baseURL, getJwt)(7);
    } finally {
        restore();
    }
    assertEquals(calls.map((call) => call.url), [
        "https://api.example.com/secure/communities/7/wallet/transactions?page=2&limit=50&filter=received",
        "https://api.example.com/secure/communities/7/wallet/transactions?page=1&limit=20&filter=all",
    ]);
});
