import { assertEquals, assertInstanceOf } from "@std/assert";
import { InMemoryAccountContext } from "@blowater/nostr-sdk";
import { Client } from "../sdk.ts";
import { ApiError } from "../helpers/_helper.ts";

const PRESIGNED_URL = "https://bucket.s3.amazonaws.com/abc-123-photo.jpg?X-Amz-Signature=sig";
const CDN_URL = "https://cdn.example.com";

// Stubs the presign POST and the S3 PUT; no network.
const withStubbedFetch = async (putStatus: number, run: (requests: Request[]) => Promise<void>) => {
    const originalFetch = globalThis.fetch;
    const requests: Request[] = [];
    globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
        const request = new Request(input, init);
        requests.push(request);
        if (request.method === "POST") {
            return Promise.resolve(new Response(JSON.stringify({ url: PRESIGNED_URL }), { status: 200 }));
        }
        return Promise.resolve(
            new Response(putStatus === 200 ? "" : "<Error>SignatureDoesNotMatch</Error>", {
                status: putStatus,
            }),
        );
    };
    try {
        await run(requests);
    } finally {
        globalThis.fetch = originalFetch;
    }
};

const newClient = () => {
    const signer = InMemoryAccountContext.Generate();
    const client = Client.New({
        baseURL: "https://api.example.com",
        relay_url: "wss://relay.example.com",
        aws_cdn_url: CDN_URL,
        getJwt: () => "jwt",
        getNostrSigner: async () => signer,
    });
    if (client instanceof Error) throw client;
    return client;
};

Deno.test("uploadFile returns an ApiError when S3 rejects the PUT", async () => {
    await withStubbedFetch(403, async () => {
        const result = await newClient().uploadFile({
            file: new File(["x"], "photo.jpg", { type: "image/jpeg" }),
        });
        assertInstanceOf(result, ApiError);
        assertEquals(result.status, 403);
    });
});

Deno.test("uploadFile returns the CDN URL and sends the file type when S3 accepts the PUT", async () => {
    await withStubbedFetch(200, async (requests) => {
        const result = await newClient().uploadFile({
            file: new File(["x"], "photo.jpg", { type: "image/jpeg" }),
        });
        if (result instanceof Error) throw result;
        assertEquals(result.toString(), `${CDN_URL}/abc-123-photo.jpg`);

        const [presignRequest, putRequest] = requests;
        assertEquals((await presignRequest.json()).content_type, "image/jpeg");
        assertEquals(putRequest.headers.get("Content-Type"), "image/jpeg");
    });
});
