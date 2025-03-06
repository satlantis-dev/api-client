import type { Location, LocationTag } from "../models/location.ts";
import type {
    AccountLocationRole,
    Address,
    BusinessStatus,
    Client,
    LocationClaim,
    LocationDTO,
    LocationNote,
    OpeningHours,
    Place,
    PriceLevel,
    Rating,
    ReshapedNostrEvent,
} from "../sdk.ts";
import { UserResolver } from "./user.ts";

export class LocationResolver {
    id: number;
    accountRoles: AccountLocationRole | null;
    address: Address;
    bio: string | null;
    businessStatus: BusinessStatus | null;
    claim: LocationClaim | null;
    eventId: number | null;
    event: ReshapedNostrEvent | null;
    googleId: string | null;
    googleMapsUrl: string;
    rating: number | null;
    userRatingCount: number | null;
    hook: string | null;
    image: string;
    isClaimed: boolean;
    lat: number;
    lng: number;
    locationTags: LocationTag[];
    placeId: number;
    place: Place | null;
    name: string;
    notes: LocationNote[] | null;
    openingHours: OpeningHours;
    osmRef: string;
    phone: string | null;
    priceLevel: PriceLevel | null;
    score: number | null;
    tripadvisorRating: Rating | null;
    googlePlacesRating: Rating | null;
    websiteUrl: string | null;
    email: string;
    reviewSummary: string;
    placeOsmRef: string | null; // on LocationDTO but not on Location

    /**
     * @unstable
     */
    constructor(private readonly client: Client, data: Location | LocationDTO) {
        this.id = data.id;
        this.accountRoles = "accountRoles" in data ? data.accountRoles : null;
        this.address = data.address;
        this.bio = data.bio;
        this.businessStatus = "businessStatus" in data ? data.businessStatus : null;
        this.claim = "claim" in data ? data.claim : null;
        this.eventId = "eventId" in data ? data.eventId : null;
        this.event = "event" in data ? data.event : null;
        this.googleId = "googleId" in data ? data.googleId : null;
        this.googleMapsUrl = data.googleMapsUrl;
        this.rating = "rating" in data ? data.rating : null;
        this.userRatingCount = "userRatingCount" in data ? data.userRatingCount : null;
        this.hook = "hook" in data ? data.hook : null;
        this.image = data.image;
        this.isClaimed = data.isClaimed;
        this.lat = data.lat;
        this.lng = data.lng;
        this.locationTags = data.locationTags;
        this.placeId = data.placeId;
        this.place = "place" in data ? data.place : null;
        this.name = data.name;
        this.notes = "notes" in data ? data.notes : null;
        this.openingHours = data.openingHours;
        this.osmRef = data.osmRef;
        this.phone = "phone" in data ? data.phone : null;
        this.priceLevel = "priceLevel" in data ? data.priceLevel : null;
        this.score = "score" in data ? data.score : null;
        this.tripadvisorRating = "tripadvisorRating" in data ? data.tripadvisorRating : null;
        this.googlePlacesRating = "googlePlacesRating" in data ? data.googlePlacesRating : null;
        this.websiteUrl = "websiteUrl" in data ? data.websiteUrl : null;
        this.email = data.email;
        this.reviewSummary = data.reviewSummary;
        this.placeOsmRef = "placeOsmRef" in data ? data.placeOsmRef : null;
    }

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
     * @deprecated This is an old location claim relationship that will be removed in the future
     */
    getOwner = async (): Promise<UserResolver | undefined | Error> => {
        return this.client.resolver.getOwnerForLocation({ locationId: this.id });
    };
}
