import type { Category, Country, ProcessedTag, ReshapedNostrEvent, Topic, Weather } from "../sdk.ts";

import type { AccountPlaceRole } from "./account.ts";
import type { Metric } from "./metric.ts";
import type { Region } from "./region.ts";

export type PlaceLevel = "region" | "city" | "neighborhood";
export type OSMType = "node" | "relation" | "way";

export type Place = {
    id: number;
    accountRoles: AccountPlaceRole[];
    banner: string;
    categoryScores: PlaceCategoryScore[];
    description: string;
    eventId: number;
    event?: ReshapedNostrEvent;
    lat: number;
    level: PlaceLevel;
    lng: number;
    metrics: PlaceMetric[];
    osmId: number;
    osmRef: string;
    regionId: number;
    region?: Region;
    slug: string;
    name: string;
    countryId: number;
    country: Country;
    weather: Weather;
};

export interface PlaceMetric {
    dataPoints: number;
    cityId: number;
    metricId: number;
    metric: Metric;
    updatedAt?: Date;
    score: number;
    topicId: number;
    topic: Topic;
    value: number;
    valueStr: string;
}

export interface PlaceCategoryScore {
    readonly categoryId: number;
    readonly category: Category;
    readonly score: number;
    readonly rank: number;
    readonly topicScores: PlaceTopicScore[];
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
