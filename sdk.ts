import { newURL } from "./_helper.ts";
import { getPeopleOfPlace } from "./api/people.ts";
import { getPlace, getPlaceNotes } from "./api/place.ts";
import { OSMType, PlaceLevel } from "./api/share_types.ts";

export class Client {
    static New(baseURL: string | URL) {
        const validURL = newURL(baseURL);
        if (validURL instanceof Error) {
            return validURL;
        }
        return new Client(validURL);
    }

    getPlace: ReturnType<typeof getPlace>;
    getPlaceNotes: ReturnType<typeof getPlaceNotes>;
    getPeopleOfPlace: ReturnType<typeof getPeopleOfPlace>;

    private constructor(public readonly url: URL) {
        this.getPlace = getPlace(url);
        this.getPlaceNotes = getPlaceNotes(url);
        this.getPeopleOfPlace = getPeopleOfPlace(url);
    }
}

export * from "./api/place.ts";
export * from "./api/share_types.ts";
