import type { LocationTag } from "../models/location.ts";
import type { Client } from "../sdk.ts";

export class LocationResolver {
    id: number;
    bio: string;
    image: string;
    name: string;
    placeOsmRef: string;
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
        osmRef: string;
        score: number;
    }) {
        this.id = data.id;
        this.image = data.image;
        this.name = data.name;
        this.placeOsmRef = data.osmRef;
        this.lat = data.lat;
        this.lng = data.lng;
        this.bio = data.bio || "";
    }

    place = async () => {
        return this.client.getPlaceByOsmRef({ osmRef: this.placeOsmRef });
    };
}
