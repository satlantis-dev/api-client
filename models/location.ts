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
    googleMapsUrl: string;
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
    Coworking = "Coworking & Event Spaces",
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

export type LocationByPlace = {
    readonly id: number;
    readonly accounts: null;
    readonly address: Address;
    readonly bio: null;
    readonly businessStatus: BusinessStatus;
    readonly eventId: number;
    readonly event: Event;
    readonly googleId: string;
    readonly googleMapsUrl: string;
    readonly googleRating: number;
    readonly googleUserRatingCount: number;
    readonly image: string;
    readonly isClaimed: boolean;
    readonly lat: number;
    readonly lng: number;
    readonly locationTags: LocationTag[];
    readonly placeId: number;
    readonly name: string;
    // todo: the frontend does not use this field, should remove in the backend API
    // readonly notes:                 NoteElement[];
    readonly openingHours: OpeningHours;
    readonly osmRef: string;
    readonly phone: string;
    readonly priceLevel: PriceLevel;
    readonly score: number;
    readonly websiteUrl: string;
    readonly email: string;
};

export interface LocationGalleryImage {
    id: number;
    locationId: number;
    url: string;
    caption: string | null;
    category: ImageCategory;
    highlight: boolean;
    source: string;
    createdAt: Date;
}

export enum ImageCategory {
    General = "general",
    Exterior = "exterior",
    Interior = "interior",
    Amenities = "amenities",
    FoodAndDrinks = "foodandrinks",
    Menu = "menu",
}
