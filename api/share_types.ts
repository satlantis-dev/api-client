export type PlaceLevel = "region" | "city" | "neighborhood";
export type OSMType = "node" | "relation" | "way";

export interface IPlace {
    id: number;
    banner?: string;
    description: string;
    eventId: number;
    lat: number;
    level: PlaceLevel;
    lng: number;
    osmId: number;
    osmRef: string;
    slug: string;
    name: string;
    weather?: IWeather;
    region?: IRegion;
    event?: INostrEvent;
    descendants?: IAccount[];
    metrics?: IPlaceMetric[];
    notes?: IPlaceNote[];
    accountRoles?: IAccountPlaceRole[];
    categoryScores?: IPlaceCategoryScore[];
    country?: ICountry;
}

export interface IPlaceNote {
    id: number;
    placeId: number;
    noteId: number;
    note: INote;
    type: NoteType;
}

export enum NoteType {
    BASIC = 1,
    REVIEW,
    GALLERY,
    PUBLIC_CHAT,
    PRIVATE_CHAT,
    CALENDAR_EVENT,
    CALENDAR,
    PING,
    REACTION,
    DELETE_NOTE,
    REPLY_NOTE,
}

interface INote {
    id: number;
    accountId: number;
    account: IAccount;
    ancestorId: number;
    calendarEventRsvps: ICalendarEventRSVP[];
    chatMemberships: IChatMembership[];
    descendants: INote[];
    depth: number;
    descendantId: number;
    eventId: number;
    event: INostrEvent;
    type: NoteType;
    reactions: IReaction[];
    repostedNoteId?: number;
    reposts: unknown[];
    zaps: unknown[];
}

export interface IReaction {
    id: number;
    accountId: number;
    eventId: number;
    event: INostrEvent;
}

export interface IChatMembership {
    id: number;
    accountId: number;
    account: IAccount;
    lastReadNoteId: number;
    noteId: number;
    note: INote;
}

export interface ICalendarEventRSVP {
    id: number;
    accountId: number;
    account: IAccount;
    eventId: number;
    event: INostrEvent;
    status: string;
}

export interface IPlaceMetric {
    dataPoints: number;
    cityId: number;
    metricId: number;
    metric: IMetric;
    updatedAt?: Date;
    score: number;
    topicId: number;
    topic: ITopic;
    value: number;
    valueStr: string;
}

interface IWeather {
    id: number;
    main: string;
    description: string;
    icon: string;
}

export interface IAccountPlaceRole {
    id: number;
    accountId: number;
    account: IAccount;
    placeId: number;
    place: IPlace;
    active: boolean;
    type: AccountPlaceRoleTypeEnum;
}

export enum AccountPlaceRoleTypeEnum {
    FOLLOWER = 1,
    VISITOR,
    INHABITANT,
    AMBASSADOR,
}

export interface IPlaceCategoryScore {
    categoryId: number;
    category: ICategory;
    cityId: number;
    score: number;
    topicScores: IPlaceTopicScore[];
    updatedAt: Date;
}

export interface IPlaceTopicScore {
    categoryId: number;
    cityId: number;
    score: number;
    topicId: number;
    topic: ITopic;
    updatedAt: Date;
}

export interface ICountry {
    id: number;
    code: string;
    name: string;
}

interface IAccount {
    id?: number;
    about?: string;
    accountPlaceRoles?: IAccountPlaceRole[];
    accountType?: AccountType;
    authDetails?: IAuthDetail[];
    banner?: string;
    chatMemberships?: IChatMembership[];
    currencyId?: number;
    currency?: ICurrency;
    displayName?: string;
    email?: string;
    emailVerified?: boolean;
    following?: IAccount[];
    followedBy?: IAccount[];
    influenceScore?: number;
    interests?: object;
    isBusiness: boolean;
    locationRatings?: IAccountLocationRating[];
    lud06?: string;
    lud16?: string;
    name?: string;
    nip05?: string;
    notes?: INote[];
    npub: string;
    picture?: string;
    phone?: string;
    placeRatings?: IAccountPlaceRating[];
    pubKey: string;
    website?: string;
}

export interface IAccountPlaceRating {
    accountId: number;
    placeId: number;
    review: string;
    ratings: object;
}

export interface IAccountLocationRating {
    accountId: number;
    locationId: number;
    review: string;
    ratings: object;
}

interface ICurrency {
    code: string;
    name: string;
    symbol: string;
}

export interface IAuthDetail {
    id: number;
    accountid: number;
    provideruid: string;
    password: string;
}

export enum AccountType {
    BASIC = 1,
    AMBASSADOR,
    FOUNDER,
    ADMIN,
}

export interface INostrEvent {
    id: number;
    content: string;
    createdAt: number;
    kind: number;
    nostrId: string;
    pubkey: string;
    sig: string;
    tags: INostrEventTag[];
}

export interface INostrEventTag {
    id: number;
    eventId: number;
    type: string;
    values: string[];
}

export interface IRegion {
    id: number;
    code: string;
    banner: string;
    categoryScores: IRegionCategoryScore[];
    countryId: number;
    country: ICountry;
    description: string;
    eventId: number;
    event: INostrEvent;
    lat: number;
    lng: number;
    metrics: IRegionMetric[];
    name: string;
    osmId: number;
    osmLevel: string;
    osmType: OSMType;
    osmRef: string;
    places: IPlace[];
    slug: string;
    hashtags: string[];
}

export interface IRegionCategoryScore {
    categoryId: number;
    category: ICategory;
    regionId: number;
    score: number;
    topicScores: IRegionTopicScore[];
    updatedAt: Date;
}

export interface ICategory {
    id: number;
    description: string;
    name: string;
}

export interface IRegionTopicScore {
    categoryId: number;
    regionId: number;
    score: number;
    topicId: number;
    topic: ITopic;
    userNumber: number;
    userScore: number;
}

export interface ITopic {
    id: number;
    categoryId: number;
    description: string;
    inFocus: boolean;
    name: string;
    weight: number;
}

export interface IRegionMetric {
    dataPoints: number;
    regionId: number;
    metricId: number;
    metric: IMetric;
    updatedAt: Date;
    value: number;
    valueStr: string;
    score: number;
}

export interface IMetric {
    id: number;
    categoryId: number;
    category: ICategory;
    description: string;
    format: IMetricFormat;
    metricSourceId: number;
    metricSource: IMetricSource;
    name: string;
    prompt?: string;
    slug?: string;
    sourceId: string;
    suffix?: string;
    tags?: string;
    topicId: number;
    topic: ITopic;
    weight: number;
}

export enum IMetricFormat {
    ONE_TO_FIVE = 1,
    ZERO_TO_ONEHUNDRED_HIGH_BETTER,
    ZERO_TO_ONEHUNDRED_LOW_BETTER,
    AMOUNT_LOC_CURR,
    NUMERIC_HIGH_BETTER,
    NUMERIC_LOW_BETTER,
    YES_NO,
}

export interface IMetricSource {
    id: number;
    frequency: string;
    lastUpdated: Date;
    name: string;
    url: string;
}
