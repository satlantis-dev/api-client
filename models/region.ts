import { Category, Country, NostrEvent, Topic } from "../sdk.ts";
import { Metric } from "./metric.ts";
import { OSMType, Place } from "./place.ts";

export type RegionMetric = {
    dataPoints: number;
    regionId: number;
    metricId: number;
    metric: Metric;
    updatedAt: Date;
    value: number;
    valueStr: string;
    score: number;
};

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

export interface RegionTopicScore {
    categoryId: number;
    regionId: number;
    score: number;
    topicId: number;
    topic: Topic;
    userNumber: number;
    userScore: number;
}
