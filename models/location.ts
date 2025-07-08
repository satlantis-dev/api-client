import type { BusinessStatus, Note, NoteType, OpeningHours, Place, PriceLevel } from "../sdk.ts";
import type { AccountDTO } from "./account.ts";

// https://github.com/satlantis-dev/models/blob/main/account_location_role.go#L11
export enum AccountLocationRoleType {
    Owner = 1,
    Admin,
    Staff,
    DiscoveredBy,
    RecommendedBy,
    BookmarkedBy,
}

export enum LocationCategoryName {
    Attractions = "Attractions",
    Coworking = "Coworking & Event Spaces",
    Healthcare = "Healthcare",
    RestaurantsCafes = "Restaurants & Cafes",
    Extras = "extras",
    Nightlife = "Nightlife",
    Others = "Others",
    Lodging = "Lodging",
    WellnessFitness = "Health & Wellness",
    GrocerySpecialtyFoods = "Markets & Specialty Foods",
    SouvenirsGifts = "Souvenirs & Gifts",
    Satlantis = "satlantis",
}

export enum ImageCategory {
    General = "general",
    Exterior = "exterior",
    Interior = "interior",
    Amenities = "amenities",
    FoodAndDrinks = "foodandrinks",
    Menu = "menu",
}

// export enum LocationAccountTypeEnum {
//     OWNER = "owner",
//     MANAGER = "manager",
//     MEMBER = "member",
//     VISITOR = "visitor",
// }

// export interface LocationAccount {
//     locationId: number;
//     accountId: number;
//     type: LocationAccountTypeEnum;
// }

// https://github.com/satlantis-dev/models/blob/main/location.go#L117
export type Location = {
    id: number;
    accountRoles: AccountLocationRole[];
    address: Address;
    bio: string;
    businessStatus: BusinessStatus;
    claim: LocationClaim;
    googleId: string;
    googleMapsUrl: string;
    rating: number;
    userRatingCount: number;
    hook?: string;
    image: string;
    isClaimed: boolean;
    lat: number;
    lng: number;
    locationTags: LocationTag[];
    placeId: number;
    place: Place;
    name: string;
    notes: LocationNote[];
    openingHours: OpeningHours;
    osmRef: string;
    phone: string;
    priceLevel: PriceLevel;
    score: number;
    tripadvisorRating: Rating;
    googlePlacesRating: Rating;
    websiteUrl: string;
    email: string;
    reviewSummary: string;
    reviewHighlights: { [key: string]: string };
    socials: Socials;
};

// https://github.com/satlantis-dev/models/blob/main/account_location_role.go#L20
export interface AccountLocationRole {
    accountId: number;
    account: AccountDTO;
    locationId: number;
    location?: Location;
    type: AccountLocationRoleType;
}

// https://github.com/satlantis-dev/models/blob/main/location_claim.go#L7
export interface LocationClaim {
    locationId: number;
    location: LocationDTO;
    ownerAccountId: number;
    ownerAccount: AccountDTO;
    claimCode: string;
    referredBy?: string;
}

// https://github.com/satlantis-dev/models/blob/main/location.go#L157
export interface LocationDTO {
    id: number;
    address: Address;
    bio?: string;
    email: string;
    rating: number;
    userRatingCount: number;
    googleMapsUrl: string;
    hook?: string;
    image: string;
    isClaimed: boolean;
    lat: number;
    lng: number;
    locationTags: LocationTag[];
    name: string;
    openingHours: OpeningHours;
    osmRef: string;
    placeId: number;
    placeOsmRef: string;
    reviewSummary: string;
    reviewHighlights: { [key: string]: string };
}

export interface Rating {
    source: string;
    id: string;
    rating: number;
    count: number;
    link: string;
}

export interface Socials {
    facebook?: string;
    instagram?: string;
    line?: string;
    telegram?: string;
    tiktok?: string;
    whatsapp?: string;
    x?: string;
    youtube?: string;
}

export type LocationInfo = {
    bio: string;
    websiteUrl: string;
    openingHours: OpeningHours;
    phone: string;
    email: string;
};

export type LocationByID = {
    id: number;
    bio?: string;
    image: string;
    lat: number;
    lng: number;
    locationTags?: LocationTag[];
    name: string;
    placeOsmRef: string;
    score: number;
    openingHours: OpeningHours;
    address: Address;
    googleRating: number;
    googleUserRatingCount: number;
    email: string;
    phone?: string;
    websiteUrl?: string;
    isClaimed: boolean;
    googleMapsUrl: string;
};

export type Address = {
    readonly streetNumber: string;
    readonly route: string;
    readonly locality: string;
    readonly postalCode: string;
    readonly country: string;
    readonly formatted: string;
};

// https://github.com/satlantis-dev/models/blob/main/location_note.go#L7
export interface LocationNote {
    id: number;
    locationId: number;
    noteId: number;
    note: Note;
    type: NoteType;
}

// https://github.com/satlantis-dev/models/blob/main/location_tag.go#L9
export interface LocationTag {
    id: number;
    category: string;
    locationCategory: LocationTagCategory;
    key: string;
    value: string;
    osmPull: boolean;
    eligible: boolean;
    section: string | null;
    locations: Location[];
    hashtags: string[];
}

// https://github.com/satlantis-dev/models/blob/main/location_tag.go#L3
interface LocationTagCategory {
    name: string;
    eligible: boolean;
    primary: boolean;
}

export interface LocationCategory {
    name: LocationCategoryName;
    subCategory: {
        key: string;
        value: string[];
    }[];
}

export interface LocationGalleryImage {
    id: number;
    locationId: number;
    url: string;
    caption?: string;
    category: ImageCategory;
    highlight: boolean;
    source: string;
    createdAt: Date;
}

export interface LocationLink {
    app: string;
    link: string;
}
