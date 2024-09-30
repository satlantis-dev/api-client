import type { LocationByID, LocationTag } from "../models/location.ts";
import type { Client } from "../sdk.ts";

export class LocationResolver implements LocationByID {
    id: number;
    bio: string;
    image: string;
    name: string;
    placeOsmRef: string;
    lat: number;
    lng: number;
    locationTags: LocationTag[];
    score: number;
    openingHours: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    };

    /**
     * @unstable
     */
    constructor(private readonly client: Client, data: LocationByID) {
        this.id = data.id;
        this.image = data.image;
        this.name = data.name;
        this.placeOsmRef = data.placeOsmRef;
        this.lat = data.lat;
        this.lng = data.lng;
        this.bio = data.bio || "";
        this.locationTags = data.locationTags || [];
        this.openingHours = data.openingHours;
        this.score = data.score;
    }

    place = async () => {
        return this.client.getPlaceByOsmRef({ osmRef: this.placeOsmRef });
    };

    /**
     * @unstable
     */
    getReviews = async (args: { limit: number; page: number }) => {
        return this.client.getLocationReviews({
            locationId: this.id,
            limit: args.limit,
            page: args.page,
        });
    };
}
