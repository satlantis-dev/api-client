import { CalendarEventType } from "./calendar.ts";
import { Note, NoteType } from "./note.ts";
import { OSMType, Place } from "./place.ts";
import { Account } from "./secure/account.ts";

export interface Reaction {
    id: number;
    accountId: number;
    eventId: number;
    event: NostrEvent;
}

export type Weather = {
    id: number;
    placeId: number;
    humidity: number;
    pressure: number;
    temp: number;
};

export interface PlaceCategoryScore {
    categoryId: number;
    category: Category;
    cityId: number;
    score: number;
    topicScores: PlaceTopicScore[];
    updatedAt: Date;
}

export interface PlaceTopicScore {
    categoryId: number;
    cityId: number;
    score: number;
    topicId: number;
    topic: Topic;
    updatedAt: Date;
}

export interface Country {
    id: number;
    code: string;
    name: string;
}

export interface AuthDetail {
    id: number;
    accountid: number;
    provideruid: string;
    password: string;
}

export interface NostrEvent {
    id: number;
    content: string;
    createdAt: number;
    kind: number;
    nostrId: string;
    pubkey: string;
    sig: string;
    tags: NostrEventTag[];
}

export interface NostrEventTag {
    id: number;
    eventId: number;
    type: string;
    values: string[];
}

export interface Region {
    id: number;
    code: string;
    banner: string;
    categoryScores: RegionCategoryScore[];
    countryId: number;
    country: Country;
    description: string;
    eventId: number;
    event: NostrEvent;
    lat: number;
    lng: number;
    metrics: RegionMetric[];
    name: string;
    osmId: number;
    osmLevel: string;
    osmType: OSMType;
    osmRef: string;
    places: Place[];
    slug: string;
    hashtags: string[];
}

export interface RegionCategoryScore {
    categoryId: number;
    category: Category;
    regionId: number;
    score: number;
    topicScores: RegionTopicScore[];
    updatedAt: Date;
}

export interface Category {
    id: number;
    description: string;
    name: string;
}

export interface RegionTopicScore {
    categoryId: number;
    regionId: number;
    score: number;
    topicId: number;
    topic: Topic;
    userNumber: number;
    userScore: number;
}

export interface Topic {
    id: number;
    categoryId: number;
    description: string;
    inFocus: boolean;
    name: string;
    weight: number;
}

export interface RegionMetric {
    dataPoints: number;
    regionId: number;
    metricId: number;
    metric: Metric;
    updatedAt: Date;
    value: number;
    valueStr: string;
    score: number;
}

export enum BusinessStatus {
    CLOSED_PERMANENTLY = "CLOSED_PERMANENTLY",
    CLOSED_TEMPORARILY = "CLOSED_TEMPORARILY",
    OPERATIONAL = "OPERATIONAL",
}

export enum PriceLevel {
    PRICE_LEVEL_UNSPECIFIED = "PRICE_LEVEL_UNSPECIFIED",
    PRICE_LEVEL_FREE = "PRICE_LEVEL_FREE",
    PRICE_LEVEL_INEXPENSIVE = "PRICE_LEVEL_INEXPENSIVE",
    PRICE_LEVEL_MODERATE = "PRICE_LEVEL_MODERATE",
    PRICE_LEVEL_EXPENSIVE = "PRICE_LEVEL_EXPENSIVE",
    PRICE_LEVEL_VERY_EXPENSIVE = "PRICE_LEVEL_VERY_EXPENSIVE",
}

export interface OpeningHours {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
}

export interface Address {
    streetNumber: string;
    route: string;
    locality: string;
    postalCode: string;
    country: string;
}

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
    locations: Location[] | null | undefined;
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

export interface Location {
    id: number;
    name: string;
    accounts: LocationAccount[];
    lat: number;
    lng: number;
    locationTags: LocationTag[];
    osmRef: string;
    googleId: string;
    placeId: number;
    eventId: number;
    event: NostrEvent;
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
}

export interface Metric {
    id: number;
    categoryId: number;
    category: Category;
    description: string;
    format: MetricFormat;
    metricSourceId: number;
    metricSource: MetricSource;
    name: string;
    prompt?: string;
    slug?: string;
    sourceId: string;
    suffix?: string;
    tags?: string;
    topicId: number;
    topic: Topic;
    weight: number;
}

export enum MetricFormat {
    ONE_TO_FIVE = 1,
    ZERO_TO_ONEHUNDRED_HIGH_BETTER,
    ZERO_TO_ONEHUNDRED_LOW_BETTER,
    AMOUNT_LOC_CURR,
    NUMERIC_HIGH_BETTER,
    NUMERIC_LOW_BETTER,
    YES_NO,
}

export interface MetricSource {
    id: number;
    frequency: string;
    lastUpdated: Date;
    name: string;
    url: string;
}

export type PlaceEvent = {
    readonly id: number;
    readonly nostrId: string;
    readonly createdAt: number;
    readonly content: string;
    readonly kind: 37515;
    readonly pubkey: string;
    readonly sig: string;
    readonly tags: ProcessedTag[];
    readonly reconciled: boolean;
};

export type ProcessedTag = {
    readonly type: TagType;
    readonly eventId: number;
    readonly values: string[];
};

export type TagType = "g" | "d" | "name" | "r" | "t" | "a";

// Get EventTypes as string
export const EventTypesAsString = (): string[] => {
    const names = [
        "Conference",
        "Meetup",
        "Hackathon",
        "Concert",
        "Workshop",
        "Party",
        "Play",
        "Sports",
        "Exhibition",
        "Festival",
        "Music",
        "Other",
    ];

    return names;
};
