import { Client } from "./sdk.ts";
import {assertEquals, fail} from "@std/assert";

const client = Client("http://localhost:8080")

// we can run this test suit in github action
// so that we always have up to date client SDK
Deno.test("/place", async () => {
    const result = await client.getPlace_V2({
        osmID: 1852574,
    })
    if(result instanceof Error) {
        console.log(result)
        fail()
    }
    // assertEquals(result, {})
    console.log(result)
})

Deno.test("/notes", async () => {
    const result = await client.GetNotesOfPlace({
        placeID: 23949
    })
    if(result instanceof Error) {
        console.log(result)
        fail()
    }
    // assertEquals(result, {})
    console.log(result)
})
