import type { LocationTag } from "../models/location.ts";
import type { Client } from "../sdk.ts";

export class LocationResolver {
    id: number;
    bio: string;
    image: string;
    name: string;
    placeID: number;
    lat: number;
    lng: number;

    /**
     * @unstable
     */
    constructor(private readonly client: Client, data: {
        id: number;
        bio: string | null;
        image: string;
        lat: number;
        lng: number;
        locationTags: LocationTag[] | null;
        name: string;
        placeId: number;
        score: number;
    }) {
        this.id = data.id;
        this.image = data.image;
        this.name = data.name;
        this.placeID = data.placeId;
        this.lat = data.lat;
        this.lng = data.lng;
        this.bio = data.bio || "";
    }

    place = async () => {
        return this.client.getPlaceByID(this.placeID);
    };
}
