import type {
    Category,
    Country,
    PlaceNote,
    ProcessedTag,
    ReshapedNostrEvent,
    Topic,
    Weather,
} from "../sdk.ts";

import type { AccountPlaceRole } from "./account.ts";
import type { Metric } from "./metric.ts";
import type { Region } from "./region.ts";

export enum PlaceLevel {
    Region = "region",
    City = "city",
    Neighborhood = "neighborhood",
}

// https://github.com/satlantis-dev/models/blob/main/source_locations.go#L10
export enum OSMType {
    Node = "node",
    Relation = "relation",
    Way = "way",
}

// https://github.com/satlantis-dev/models/blob/mian/place.go#L40
export type Place = {
    id: number;
    accountRoles: AccountPlaceRole[];
    active: boolean;
    banner: string;
    boundingBox: BoundingBox;
    categoryScores: PlaceCategoryScore[];
    countryId: number;
    country: Country;
    descendants: PlaceWithClosure[];
    description: string;
    eventId: number;
    event: ReshapedNostrEvent;
    lat: number;
    level: PlaceLevel;
    lng: number;
    metrics: PlaceMetric[];
    name: string;
    notes: PlaceNote[];
    osmId: number;
    osmLevel: string;
    osmType: OSMType;
    osmRef: string;
    placeGalleryImages: PlaceGalleryImage[];
    regionId: number;
    region: Region;
    slug: string;
    weatherId: number;
    weather: Weather;
    hashtags: string[];
};

export interface BoundingBox {
    minlat: number;
    maxlat: number;
    minlng: number;
    maxlng: number;
}

export interface PlaceWithClosure extends Place {
    ancestorId: number;
    descendantId: number;
    depth: number;
}

// https://github.com/satlantis-dev/models/blob/main/place_metric.go#L7
export interface PlaceMetric {
    readonly metric: Metric;
    readonly value: number;
    readonly valueStr: string;
    readonly score: number;
}

// https://github.com/satlantis-dev/models/blob/main/place_category_score.go#L7
export interface PlaceCategoryScore {
    categoryId: number;
    category: Category;
    placeId: number;
    score: number;
    rank: number;
    topicScores: PlaceTopicScore[];
}

export interface PlaceTopicScore {
    readonly categoryId: number;
    readonly placeId: number;
    readonly score: number;
    readonly updatedAt: Date;
    readonly topicId: number;
    readonly topic: Topic;
    readonly userNumber: number;
    readonly userScore: number;
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

// https://github.com/satlantis-dev/models/blob/main/place_gallery_image.go#L5
export interface PlaceGalleryImage {
    readonly id: number;
    readonly placeId: number;
    readonly url: string;
    readonly caption: string | null;
    readonly source: string | null;
    readonly createdAt: string; //  ISO 8601 string
}
