import { Client } from "./api.ts";
import {assertEquals, fail} from "@std/assert";

const client = Client("http://localhost:8080")

// we can run this test suit in github action
// so that we always have up to date client SDK
Deno.test("/place", async () => {
    const result = await client.getPlace_V2({
        osm_id: 1852574,
        countryCode: "cz",
        placeSlug: "prague",
        regionCode: "-"
    })
    if(result instanceof Error) {
        console.log(result)
        fail()
    }
    // assertEquals(result, {})
    console.log(result)
})
