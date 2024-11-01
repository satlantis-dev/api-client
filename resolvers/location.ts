import type { LocationByID, LocationTag } from "../models/location.ts";
import type { Address, Client, OpeningHours } from "../sdk.ts";
import { UserResolver } from "./user.ts";

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
    openingHours: OpeningHours;
    address: Address;
    googleRating: number;
    googleUserRatingCount: number;
    email: string;
    phone: string;
    websiteUrl: string;
    isClaimed?: boolean;

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
        this.address = data.address;
        this.googleRating = data.googleRating;
        this.googleUserRatingCount = data.googleUserRatingCount;
        this.email = data.email || "";
        this.phone = data.phone || "";
        this.websiteUrl = data.websiteUrl || "";
        this.isClaimed = data.isClaimed;
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

    /**
     * @unstable
     */
    getOwner = async (): Promise<UserResolver | undefined | Error> => {
        return this.client.resolver.getOwnerForLocation({ locationId: this.id });
    };
}
