import type { Location, LocationLink, LocationTag, Socials } from "../models/location.ts";
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
} from "../sdk.ts";
import { UserResolver } from "./user.ts";

export class LocationResolver {
    id: number;
    address: Address;
    googleMapsUrl: string;
    image: string;
    banner?: string;
    isClaimed: boolean;
    lat: number;
    lng: number;
    locationTags: LocationTag[];
    name: string;
    placeId: number;
    openingHours: OpeningHours;
    email: string;
    reviewSummary: string;
    osmRef: string;
    score?: number;
    accountRoles?: AccountLocationRole;
    bio?: string;
    businessStatus?: BusinessStatus;
    claim?: LocationClaim;
    googleId?: string;
    rating?: number;
    userRatingCount?: number;
    hook?: string;
    place?: Place;
    notes?: LocationNote[];
    phone?: string;
    priceLevel?: PriceLevel;
    tripadvisorRating?: Rating;
    googlePlacesRating?: Rating;
    websiteUrl?: string;
    placeOsmRef?: string;
    socials?: Socials;

    /**
     * @unstable
     */
    constructor(private readonly client: Client, data: Location | LocationDTO) {
        this.id = data.id;
        this.address = data.address;
        this.googleMapsUrl = data.googleMapsUrl;
        this.image = data.image;
        this.banner = data.banner;
        this.isClaimed = data.isClaimed;
        this.lat = data.lat;
        this.lng = data.lng;
        this.locationTags = data.locationTags;
        this.name = data.name;
        this.placeId = data.placeId;
        this.openingHours = data.openingHours;
        this.email = data.email;
        this.reviewSummary = data.reviewSummary;
        this.osmRef = data.osmRef;

        // Handle fields that are specific to Location
        if ("accountRoles" in data) {
            this.accountRoles = data.accountRoles;
        }
        if ("bio" in data) {
            this.bio = data.bio;
        }
        if ("businessStatus" in data) {
            this.businessStatus = data.businessStatus;
        }
        if ("claim" in data) {
            this.claim = data.claim;
        }
        if ("googleId" in data) {
            this.googleId = data.googleId;
        }
        if ("rating" in data) {
            this.rating = data.rating;
        }
        if ("userRatingCount" in data) {
            this.userRatingCount = data.userRatingCount;
        }
        if ("hook" in data) {
            this.hook = data.hook;
        }
        if ("place" in data) {
            this.place = data.place;
        }
        if ("notes" in data) {
            this.notes = data.notes;
        }
        if ("phone" in data) {
            this.phone = data.phone;
        }
        if ("priceLevel" in data) {
            this.priceLevel = data.priceLevel;
        }
        if ("tripadvisorRating" in data) {
            this.tripadvisorRating = data.tripadvisorRating;
        }
        if ("googlePlacesRating" in data) {
            this.googlePlacesRating = data.googlePlacesRating;
        }
        if ("websiteUrl" in data) {
            this.websiteUrl = data.websiteUrl;
        }
        if ("socials" in data) {
            this.socials = data.socials;
        }
        if ("score" in data) {
            this.score = data.score;
        }

        // Handle fields that are specific to LocationDTO
        if ("placeOsmRef" in data) {
            this.placeOsmRef = data.placeOsmRef;
        }
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

    /**
     * @unstable
     */
    getLinks = async (): Promise<LocationLink[] | Error> => {
        return this.client.getLocationLinks({ locationId: this.id });
    };
}
