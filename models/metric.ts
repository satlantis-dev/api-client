import type { Category, Topic } from "../api/share_types.ts";

// https://github.com/satlantis-dev/models/blob/main/metric.go#L41
export interface Metric {
    id: number;
    categoryId: number;
    category: Category;
    description: string;
    name: string;
    order: number;
    prompt: string;
    slug: string;
    suffix: string;
    tags: Tags;
    topicId: number;
    topic: Topic;
    format: MetricFormat;
}

export enum Tags {
    CostOfLiving = "{cost_of_living}",
    Demographics = "{demographics}",
    Empty = "{}",
    MobileInternet = "{mobile_&_internet}",
    Money = "{money}",
    Transport = "{transport}",
    TravelerInformation = "{traveler_information}",
}

export enum MetricFormat {
    ONE_TO_FIVE = 1,
    ZERO_TO_ONEHUNDRED_HIGH_BETTER,
    ZERO_TO_ONEHUNDRED_LOW_BETTER,
    AMOUNT_LOC_CURR,
    NUMERIC_HIGH_BETTER,
    NUMERIC_LOW_BETTER,
    YES_NO,
    NON_NUMERIC,
}

export interface MetricSource {
    id: number;
    frequency: string;
    lastUpdated: Date;
    name: string;
    url: string;
}

export interface Brand {
    readonly name: string;
    readonly type: string;
    readonly website: string;
    readonly logo: string;
}
