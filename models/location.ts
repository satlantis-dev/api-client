import type { BusinessStatus, Note, NoteType, OpeningHours, PriceLevel, ReshapedNostrEvent } from "../sdk.ts";

export type Location = {
    id: number;
    name: string;
    accounts: LocationAccount[];
    lat: number;
    lng: number;
    locationTags: LocationTag[];
    image: string;
    osmRef: string;
    googleId: string;
    placeId: number;
    eventId: number;
    event: ReshapedNostrEvent;
    score: number;
    address: Address;
    phone: string;
    notes: LocationNote[];
    businessStatus: BusinessStatus;
    openingHours: OpeningHours;
    priceLevel: PriceLevel;
    googleRating: number;
    googleUserRatingCount: number;
    websiteUrl: string;
    bio: string;
};

export type LocationInfo = {
    bio: string;
    websiteUrl: string;
    openingHours: OpeningHours;
    phone: string;
    email: string;
};

export type LocationByID = {
    id: number;
    bio: string | null;
    image: string;
    lat: number;
    lng: number;
    locationTags: LocationTag[] | null;
    name: string;
    placeOsmRef: string;
    score: number;
    openingHours: OpeningHours;
    address: Address;
    googleRating: number;
    googleUserRatingCount: number;
    email?: string;
};

export type Address = {
    readonly streetNumber: string;
    readonly route: string;
    readonly locality: string;
    readonly postalCode: string;
    readonly country: string;
};

export interface LocationNote {
    id: number;
    locationId: number;
    noteId: number;
    note: Note;
    type: NoteType;
}

export interface LocationTag {
    id: number;
    category: string;
    key: string;
    value: string;
    eligible: boolean;
}

export enum LocationCategoryName {
    Attractions = "Attractions",
    Coworking = "Coworking",
    Healthcare = "Healthcare",
    RestaurantsCafes = "Restaurants & Cafes",
    Extras = "extras",
    Nightlife = "Nightlife",
    Others = "Others",
    Lodging = "Lodging",
    WellnessFitness = "Wellness & Fitness",
    GrocerySpecialtyFoods = "Grocery & Specialty Foods",
    SouvenirsGifts = "Souvenirs & Gifts",
    Satlantis = "satlantis",
}

export interface LocationCategory {
    name: LocationCategoryName;
    subCategory: {
        key: string;
        value: string[];
    }[];
}

export enum LocationAccountTypeEnum {
    OWNER = "owner",
    MANAGER = "manager",
    MEMBER = "member",
    VISITOR = "visitor",
}

export interface LocationAccount {
    locationId: number;
    accountId: number;
    type: LocationAccountTypeEnum;
}
