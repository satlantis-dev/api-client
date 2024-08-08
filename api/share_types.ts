export type PlaceLevel = "region" | "city" | "neighborhood";
export type OSMType = "node" | "relation" | "way";

export type Place = {
  id: number;
  banner: string;
  description: string;
  eventId: number;
  lat: number;
  level: PlaceLevel;
  lng: number;
  osmId: number;
  osmRef: string;
  regionId: number;
  slug: string;
  name: string;
  countryId: number;
  country: Country;
  weather: Weather;
};

export interface PlaceNote {
  id: number;
  placeId: number;
  noteId: number;
  note: Note;
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
  MediaNote,
}

export type Note = {
  id: number;
  accountId: number;
  account: Account;
  ancestorId: number;
  calendarEventRsvps: CalendarEventRSVP[];
  chatMemberships: ChatMembership[];
  descendants: Note[];
  depth: number;
  descendantId: number;
  eventId: number;
  event: NostrEvent;
  type: NoteType;
  reactions: Reaction[];
  repostedNoteId?: number;
  reposts: unknown[];
  zaps: unknown[];
};

export interface Reaction {
  id: number;
  accountId: number;
  eventId: number;
  event: NostrEvent;
}

export interface ChatMembership {
  id: number;
  accountId: number;
  account: Account;
  lastReadNoteId: number;
  noteId: number;
  note: Note;
}

export interface Discussion extends ChatMembership {
  lastMessage: Note;
  notSeenCount: number;
}

export interface CalendarEventRSVP {
  id: number;
  accountId: number;
  account: Account;
  eventId: number;
  event: NostrEvent;
  status: string;
}

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

export type Weather = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

export type AccountPlaceRole = {
  id: number;
  accountId: number;
  account: Account;
  placeId: number;
  active: boolean;
  type: AccountPlaceRoleTypeEnum;
  place?: Place;
};

export enum AccountPlaceRoleTypeEnum {
  FOLLOWER = 1,
  VISITOR,
  INHABITANT,
  AMBASSADOR,
}

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

export type Account = {
  id: number;
  about: string;
  accountType: AccountType;
  following: Account[];
  followedBy: Account[];
  npub: string;
  pubKey: string;
  accountPlaceRoles?: AccountPlaceRole[];
  authDetails?: AuthDetail[];
  banner?: string;
  chatMemberships?: ChatMembership[];
  currencyId?: number;
  currency?: Currency;
  displayName?: string;
  email?: string;
  emailVerified?: boolean;
  influenceScore?: number;
  interests?: object;
  isAdmin?: boolean;
  isBusiness: boolean;
  locationRatings?: AccountLocationRating[];
  lud06?: string;
  lud16?: string;
  name?: string;
  nip05?: string;
  picture?: string;
  phone?: string;
  placeRatings?: AccountPlaceRating[];
  website?: string;
};

export interface AccountPlaceRating {
  accountId: number;
  placeId: number;
  review: string;
  ratings: object;
}

export interface AccountLocationRating {
  accountId: number;
  locationId: number;
  review: string;
  ratings: object;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface AuthDetail {
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
