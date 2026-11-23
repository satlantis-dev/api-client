import { assertEquals } from "@std/assert";
import { putUpdateCalendarEvent } from "../api/secure/calendar.ts";

const requestedUrl = async (options?: { markdown?: boolean }) => {
    const original = globalThis.fetch;
    let requested = "";
    globalThis.fetch = ((input: Request | URL | string) => {
        requested = input instanceof Request ? input.url : input.toString();
        return Promise.resolve(new Response("{}", { status: 200 }));
    }) as typeof fetch;
    try {
        // deno-lint-ignore no-explicit-any
        await putUpdateCalendarEvent(new URL("https://api.example.com"), () => "jwt")({} as any, options);
    } finally {
        globalThis.fetch = original;
    }
    return requested;
};

Deno.test("putUpdateCalendarEvent sends no markdown flag by default", async () => {
    assertEquals(await requestedUrl(), "https://api.example.com/secure/events");
});

Deno.test("putUpdateCalendarEvent sends markdown=true when asked", async () => {
    assertEquals(
        await requestedUrl({ markdown: true }),
        "https://api.example.com/secure/events?markdown=true",
    );
});
