import { assertEquals, fail } from "@std/assert";

import { Client, getNip5, type Place } from "../sdk.ts";

const clientNoAuth = Client.New({ baseURL: "https://api-dev.satlantis.io" });
if (clientNoAuth instanceof Error) {
    fail(clientNoAuth.message);
}

// we can run this test suit in github action
// so that we always have up to date client SDK
Deno.test("getPlace", async () => {
    const result = await clientNoAuth.getPlace({
        osmRef: "R8421413",
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result.regionId);
});

Deno.test("getPlaces", async () => {
    const result = await clientNoAuth.getPlaces({
        filters: { name: "london" },
        limit: 1,
        page: 0,
        sortColumn: "score",
        sortDirection: "desc",
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }

    const ok = result.find((p) => p.name.toLowerCase() == "london") as Place;
    assertEquals(ok.name.toLowerCase(), "london");
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
    assertEquals(result.length > 0, true);
});

Deno.test("/getPlaceCalendarEvents", async () => {
    const result = await clientNoAuth.getPlaceCalendarEvents({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
});

Deno.test("/getPlaceMetrics", async () => {
    const result = await clientNoAuth.getPlaceMetrics({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
});

Deno.test("/getPlaceCalenderEvents", async () => {
    const result = await clientNoAuth.getPlaceCalendarEvents({
        placeID: 23949,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length > 0, true);
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
    assertEquals(result.length > 0, true);
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
    assertEquals(result.places.length > 0, true);
});

Deno.test("/getLocationsWithinBoundingBox", async () => {
    const result = await clientNoAuth.getLocationsWithinBoundingBox({
        sw_lat: 32.56768764046221,
        ne_lat: 32.766068258492425,
        ne_lng: -16.800802131347382,
        sw_lng: -17.04730786865258,
        google_rating: 0,
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
    assertEquals(result.length > 0, true);
});

Deno.test("nip5", async () => {
    const result = await getNip5({ name: "_", domain: "https://www.satlantis.io" });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});

Deno.test("getAccount", async () => {
    const npub = "npub1le59glyc3r9zsddury0fu8wyqu69ckvj78fn4425m5xn9zd0zpdssjtd53";
    const result = await clientNoAuth.getAccount({
        npub,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.npub, npub);
});

Deno.test("get notes", async () => {
    const result = await clientNoAuth.getNotes({
        npub: "npub1le59glyc3r9zsddury0fu8wyqu69ckvj78fn4425m5xn9zd0zpdssjtd53",
        limit: 2,
        page: 0,
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    assertEquals(result.length == 2, true);

    const note = await clientNoAuth.getNote({ noteID: result[0].id });
    if (note instanceof Error) fail(note.message);
    if (note == undefined) fail(`${result[0].id} should be present`);
    console.log(note);
    // should be the same ntoe
    assertEquals(note.itself.id, result[0].id);
    assertEquals(note.itself.event.content, result[0].event.content);
    assertEquals(note.itself.event.sig, result[0].event.sig);
});

Deno.test("getIpInfo", async () => {
    const result = await clientNoAuth.getIpInfo();
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(JSON.stringify(result));
});

Deno.test("getLocationReviews", async () => {
    const result = await clientNoAuth.getLocationReviews({
        limit: 2,
        page: 0,
        locationId: 2313,
    });
    if (result instanceof Error) fail(result.message);
    console.log(result);
});
