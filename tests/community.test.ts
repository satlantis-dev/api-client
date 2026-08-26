import { assertEquals } from "@std/assert";
import { listCommunityMembersAndProspects, listCommunityProspects } from "../api/community.ts";

/**
 * Stubs `fetch`, records the URLs the SDK builds, and replies with `payload`. Returns the recorded
 * URLs plus a `restore` the test must call.
 */
function stubFetch(payload: unknown) {
    const seen: string[] = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = ((input: string | URL | Request) => {
        seen.push(String(input instanceof Request ? input.url : input));
        return Promise.resolve(
            new Response(JSON.stringify(payload), {
                status: 200,
                headers: { "content-type": "application/json" },
            }),
        );
    }) as typeof fetch;
    return { seen, restore: () => (globalThis.fetch = originalFetch) };
}

const baseURL = new URL("https://api.example.com");
const getJwt = () => "jwt";

Deno.test("member records: the paginated payload is returned as-is", async () => {
    const { restore } = stubFetch({
        records: [{ id: 1 }, { id: 2 }],
        pagination: { page: 2, limit: 10, total: 12, totalPages: 2 },
    });
    try {
        const result = await listCommunityMembersAndProspects(baseURL, getJwt)({ communityId: 7 });
        if (result instanceof Error) throw result;
        assertEquals(result.records.length, 2);
        assertEquals(result.pagination.total, 12);
        assertEquals(result.pagination.totalPages, 2);
    } finally {
        restore();
    }
});

Deno.test("member records: page and limit are omitted unless the caller sets them", async () => {
    // The server defaults to page 1, limit 10 — sending nothing keeps that default intact.
    const { seen, restore } = stubFetch({
        records: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
    try {
        await listCommunityMembersAndProspects(baseURL, getJwt)({ communityId: 7 });
        const params = new URL(seen[0]).searchParams;
        assertEquals(params.has("page"), false);
        assertEquals(params.has("limit"), false);
    } finally {
        restore();
    }
});

Deno.test("member records: page and limit are forwarded when given", async () => {
    const { seen, restore } = stubFetch({
        records: [],
        pagination: { page: 3, limit: 25, total: 0, totalPages: 0 },
    });
    try {
        await listCommunityProspects(baseURL, getJwt)({ communityId: 7, page: 3, limit: 25 });
        const params = new URL(seen[0]).searchParams;
        assertEquals(params.get("page"), "3");
        assertEquals(params.get("limit"), "25");
    } finally {
        restore();
    }
});
