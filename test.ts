import { Client } from "./sdk.ts";
import { fail } from "@std/assert";

const client = Client.New("https://api-dev.satlantis.io");
if (client instanceof Error) {
    fail(client.message);
}

// we can run this test suit in github action
// so that we always have up to date client SDK
Deno.test("/place", async () => {
    const result = await client.getPlace({
        osmRef: "R8421413",
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    // assertEquals(result, {})
    console.log(result);
});

Deno.test("/notes", async () => {
    const result = await client.getPlaceNotes({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    // assertEquals(result, {})
    console.log(result);
});

Deno.test("/getPeopleOfPlace", async () => {
    const result = await client.getPeopleOfPlace({
        osmRef: "R8421413",
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    // assertEquals(result, {})
    console.log(result);
});
