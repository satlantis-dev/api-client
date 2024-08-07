import { InMemoryAccountContext } from "@blowater/nostr-sdk";
import { AccountPlaceRoleTypeEnum, Client } from "./sdk.ts";
import { assertEquals, fail } from "@std/assert";

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

Deno.test("/deleteAccountRole", async () => {
    {
        // test fot the failure cases
        const res = await clientNoAuth.deleteAccountRole({
            placeID: 23949,
            type: AccountPlaceRoleTypeEnum.AMBASSADOR,
        }) as Error;
        assertEquals(res.message, "No jwt token is provided to the client");
    }

    // login with a new nostr key
    const res = await clientNoAuth.loginNostr(InMemoryAccountContext.Generate());
    if (res instanceof Error) fail(res.message);
    console.log(res.account);

    const client = Client.New({
        baseURL: "https://api-dev.satlantis.io",
        jwtToken: res.token,
    }) as Client;

    const res2 = await client.deleteAccountRole({
        placeID: 23949,
        type: AccountPlaceRoleTypeEnum.AMBASSADOR,
    });
    console.log(res2);
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

Deno.test("this_is_a_new_API", async () => {
    const result = await clientNoAuth.this_is_a_new_API({
        arguments_here
    });
    if (result instanceof Error) {
        console.log(result);
        fail();
    }
    console.log(result);
});
