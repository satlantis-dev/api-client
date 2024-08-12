import { fail } from "@std/assert";
import { Client, getNip5 } from "../sdk.ts";

const clientNoAuth = Client.New({ baseURL: "https://api-dev.satlantis.io" });
if (clientNoAuth instanceof Error) {
    fail(clientNoAuth.message);
}

// we can run this test suit in github action
// so that we always have up to date client SDK
Deno.test("/getPlace", async () => {
    const result = await clientNoAuth.getPlace({
        osmRef: "R8421413",
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result.regionId);
});

Deno.test("/getPeopleOfPlace", async () => {
    const result = await clientNoAuth.getAccountPlaceRoles({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("/getPlaceNoteFeed", async () => {
    const result = await clientNoAuth.getPlaceNoteFeed({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("/getPlaceCalendarEvents", async () => {
    const result = await clientNoAuth.getPlaceCalendarEvents({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("/getPlaceMetrics", async () => {
    const result = await clientNoAuth.getPlaceMetrics({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("/getPlaceCalenderEvents", async () => {
    const result = await clientNoAuth.getPlaceCalendarEvents({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("/getPlaceChats", async () => {
    const result = await clientNoAuth.getPlaceChats({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("/getPlaceCategoryScores", async () => {
    const result = await clientNoAuth.getPlaceCategoryScores({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("getPlaceEvent", async () => {
    const result = await clientNoAuth.getPlaceEvent({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("getRegion", async () => {
    const result = await clientNoAuth.getRegion({
        regionID: 1170,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("/getLocationsWithinBoundingBox", async () => {
    const result = await clientNoAuth.getLocationsWithinBoundingBox({
        sw_lat: 32,
        sw_lng: -16,
        ne_lat: 32,
        ne_lng: 16,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("getLocationTags", async () => {
    const result = await clientNoAuth.getLocationTags();
    if (result instanceof Error) {
        fail(result.message);
    }
    console.log(result);
});

Deno.test("nip5", async () => {
    const result = await getNip5({ name: "_", domain: "https://www.satlantis.io" });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});
