import { Category, Topic } from "./share_types.ts";

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
