import { assertEquals } from "@std/assert";
import { getEventDetails } from "../api/events.ts";

const requestedUrl = async (args: { eventId: string; markdown?: boolean }) => {
    const original = globalThis.fetch;
    let requested = "";
    globalThis.fetch = ((input: Request | URL | string) => {
        requested = input instanceof Request ? input.url : input.toString();
        return Promise.resolve(new Response("{}", { status: 200 }));
    }) as typeof fetch;
    try {
        await getEventDetails(new URL("https://api.example.com"), () => "jwt")(args);
    } finally {
        globalThis.fetch = original;
    }
    return requested;
};

Deno.test("getEventDetails asks for plain text by default", async () => {
    assertEquals(await requestedUrl({ eventId: "7" }), "https://api.example.com/events/7");
});

Deno.test("getEventDetails asks for Markdown with markdown: true", async () => {
    assertEquals(
        await requestedUrl({ eventId: "7", markdown: true }),
        "https://api.example.com/events/7?markdown=true",
    );
});
