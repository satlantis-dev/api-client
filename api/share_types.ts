export type Weather = {
    id: number;
    placeId: number;
    humidity: number;
    pressure: number;
    temp: number;
};

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

// https://github.com/satlantis-dev/models/blob/main/event.go
export interface ReshapedNostrEvent {
    id: number;
    nostrId: string;
    createdAt: number;
    content: string;
    kind: number;
    pubkey: string;
    sig: string;
    tags: NostrEventTag[];
    reconciled: boolean;
}

export interface NostrEventTag {
    id: number;
    eventId: number;
    type: string;
    values: string[];
}

// https://github.com/satlantis-dev/models/blob/main/category.go#L3
export interface Category {
    id: number;
    description: string;
    name: string;
    weight: number;
}

// https://github.com/satlantis-dev/models/blob/main/topic.go#L3
export interface Topic {
    id: number;
    description: string;
    inFocus: boolean;
    name: string;
    weight: number;
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

export type OpeningHours = {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
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
        "conference",
        "meetup",
        "hackathon",
        "concert",
        "workshop",
        "party",
        "play",
        "sports",
        "exhibition",
        "festival",
        "music",
        "other",
    ];

    return names;
};
