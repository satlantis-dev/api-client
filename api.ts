import { FetchResult, safeFetch } from "./fetch.ts";

class ApiError extends Error {
    constructor(public readonly status: number, public readonly text: string) {
        super(`status ${status}, body ${text}`)
        this.name = ApiError.name;
    }
}


// https://github.com/satlantis-dev/api/blob/main/rest/public_routes.go#L28
const getPlace = (urlArg: string | URL) => async (args: {
    osm_id: string,
    countryCode: "cz"
    regionCode: "-",
    placeSlug: "prague"
}): Promise<Place | TypeError | DOMException | SyntaxError | ApiError>  => {
    // constructing a new URL so that we don't modify the input
    const url = newURL(urlArg)
    if(url instanceof TypeError) {
        return url
    }
    url.pathname = `/place/${args.countryCode}/${args.regionCode}/${args.placeSlug}/${args.osm_id}`
    const response = await safeFetch(url)
    if(response instanceof Error) {
        return response
    }
    if(response.status != 200) {
        const t = await response.text()
        if(t instanceof Error) {
            return t;
        }
        return new ApiError(response.status, t)
    }
    const result = await response.json()
    if(result instanceof Error) {
        return result
    }

    return result as Place // consider zod for runtime type checks
}

const getPlace_V2 = (urlArg: string | URL) => async (args: {
    osm_id: string,
    countryCode: "cz"
    regionCode: "-",
    placeSlug: "prague"
}): Promise<Place_V2 | TypeError | DOMException | SyntaxError | ApiError>  => {
    // constructing a new URL so that we don't modify the input
    const url = newURL(urlArg)
    if(url instanceof TypeError) {
        return url
    }
    url.pathname = `/v2/place/${args.countryCode}/${args.regionCode}/${args.placeSlug}/${args.osm_id}`
    const response = await safeFetch(url)
    if(response instanceof Error) {
        return response
    }
    if(response.status != 200) {
        const t = await response.text()
        if(t instanceof Error) {
            return t;
        }
        return new ApiError(response.status, t)
    }
    const result = await response.json()
    if(result instanceof Error) {
        return result
    }

    return result as Place_V2 // consider zod for runtime type checks
}

function newURL(url: string | URL) {
    try {
        return new URL(url)
    } catch (e) {
        // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#exceptions
        return e as TypeError
    }
}

export function Client(baseURL: string | URL) {
    return {
        getPlace: getPlace(baseURL),
        getPlace_V2: getPlace_V2(baseURL)
    }
}

type PlaceLevel = "region" | "city" | "neighborhood"
type OSMType = "node" | "relation" | "way"

interface Place_V2 {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    active: boolean;
    banner: string;
    countryId: number;
    description: string;
    eventId?: number | null;
    lat: number;
    level: PlaceLevel;
    lng: number;
    name: string;
    osmId?: number | null;
    osmLevel: string;
    osmType: OSMType;
    osmRef: string;
    regionId?: number | null;
    slug: string;
    weatherId?: number | null;
    hashtags: string[];
}

declare interface Place {
    id: number;
    account_roles: AccountPlaceRole[];
    active: boolean;
    banner: string;
    category_scores: PlaceCategoryScore[];
    country_id: number;
    country: Country;
    descendants: PlaceWithClosure[];
    description: string;
    event_id?: number;
    event: Event;
    lat: number;
    level: string;
    lng: number;
    metrics: PlaceMetric[];
    name: string;
    notes: PlaceNote[];
    osm_id?: number;
    osm_level: string;
    osm_type: string;
    osm_ref: string;
    region_id?: number;
    region: Region;
    slug: string;
    weather_id?: number;
    weather: Weather;
    hashtags: string[];
}

declare interface AccountPlaceRole {
    account_id: number;
    account: AccountDTO;
    place_id: number;
    place: Place;
    ambassador_request: boolean;
    type: number;
}

declare interface PlaceCategoryScore {
    category_id: number;
    category: Category;
    score: number;
    topic_scores: PlaceTopicScore[];
}

declare interface Country {
    id: number;
    code: string;
    code_3: string;
    name: string;
}

declare interface Continent {
    id: number;
    code: string;
    name: string;
}

declare interface PlaceWithClosure {
    ancestor_id: number;
    descendant_id: number;
    depth: number;
}

declare interface Event {
    id: number;
    nostr_id: string;
    created_at: number;
    content: string;
    kind: number;
    pubkey: string;
    sig: string;
    tags: Tag[];
    reconciled: boolean;
}

declare interface Tag {
    event_id: number;
    type: string;
    values: string[];
}

declare interface PlaceMetric {
    metric: MetricDTO;
    value: number;
    value_str: string;
    score: number;
}

declare interface PlaceNote {
    id: number;
    place_id: number;
    place: Place;
    note_id: number;
    note: Note;
    type: number;
}

declare interface Note {
    id: number;
    account_id: number;
    account: Account;
    calendar_event_rsvps: CalendarEventRSVP[];
    chat_memberships: ChatMembership[];
    descendants: NoteWithClosure[];
    event_id: number;
    event: Event;
    type: number;
    reposted_note_id?: number;
    reposted_note?: Note;
    reactions: Reaction[];
}

declare interface NoteWithClosure {
    ancestor_id: number;
    depth: number;
    descendant_id: number;
}

declare interface CalendarEventRSVP {
    id: number;
    account_id: number;
    account: Account;
    event_id: number;
    note_id: number;
    status: string;
}

declare interface Reaction {
    id: number;
    account_id: number;
    event_id: number;
    event: Event;
    note_id: number;
}

declare interface Account {
    id: number;
    about: string;
    account_place_roles: AccountPlaceRole[];
    account_type: number;
    auth_details: AuthenticationDetail[];
    banner: string;
    chat_memberships: ChatMembership[];
    currency_id?: number;
    currency: Currency;
    display_name: string;
    email: string;
    email_verified: boolean;
    experiences: Experience[];
    following: Follow[];
    followed_by: Follow[];
    influence_score: number;
    interests?: string;
    is_business: boolean;
    location_ratings: AccountLocationRating[];
    lud06: string;
    lud16: string;
    name: string;
    nip05: string;
    notes: Note[];
    npub: string;
    picture: string;
    phone: string;
    place_ratings: AccountPlaceRating[];
    pub_key: string;
    social_media_list: SocialMedia[];
    website: string;
    reset_password_token?: string;
    locations: LocationAccount[];
}

declare interface Region {
    id: number;
    code: string;
    banner: string;
    category_scores: RegionCategoryScore[];
    country_id: number;
    country: Country;
    description: string;
    event_id?: number;
    event: Event;
    lat: number;
    lng: number;
    metrics: RegionMetric[];
    name: string;
    osm_id?: number;
    osm_level: string;
    osm_type: string;
    osm_ref: string;
    places: Place[];
    slug: string;
    hashtags: string[];
}

declare interface Weather {
    id: number;
    place_id: number;
    humidity: number;
    pressure: number;
    temp: number;
}

declare interface AccountDTO {
    id: number;
    about: string;
    account_type: number;
    is_business: boolean;
    name: string;
    nip05: string;
    npub: string;
    picture: string;
    pub_key: string;
}

declare interface RegionCategoryScore {
    category_id: number;
    category: Category;
    score: number;
    topic_scores: RegionTopicScore[];
}

declare interface Category {
    id: number;
    description: string;
    name: string;
}

declare interface RegionTopicScore {
    category_id: number;
    region_id: number;
    score: number;
    updated_at: string;
    topic_id: number;
    topic: Topic;
    user_number: number;
    user_score: number;
}

declare interface Topic {
    id: number;
    description: string;
    in_focus: boolean;
    name: string;
    weight: number;
}

declare interface RegionMetric {
    metric: MetricDTO;
    value: number;
    value_str: string;
    score: number;
}

declare interface MetricDTO {
    id: number;
    category_id: number;
    category: Category;
    description: string;
    name: string;
    prompt: string;
    slug: string;
    suffix: string;
    tags: string;
    topic_id: number;
    topic: Topic;
}

declare interface PlaceTopicScore {
    category_id: number;
    place_id: number;
    score: number;
    updated_at: string;
    topic_id: number;
    topic: Topic;
    user_number: number;
    user_score: number;
}

declare interface ChatMembership {
    id: number;
    account_id: number;
    account: Account;
    last_read_note_id?: number;
    note_id: number;
    note: Note;
}

declare interface AuthenticationDetail {
    id: number;
    account_id: number;
    provider: number;
    password: string;
}

declare interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    exchange_rate: number;
}

declare interface Experience {
    id: number;
    account_id: number;
    city_id: number;
    cost: number;
    currency: string;
    description: string;
    name: string;
    type: string;
    url: string;
}

declare interface Follow {
    FollowerID: number;
    FollowingID: number;
}

declare interface AccountLocationRating {
    account_id: number;
    location_id: number;
    review: string;
    ratings: string;
}

declare interface AccountPlaceRating {
    account_id: number;
    place_id: number;
    review: string;
    ratings: string;
}

declare interface SocialMedia {
    id: number;
    name: string;
    link: string;
    account_id: number;
    business_id: number;
    social_media_type: number;
}

declare interface LocationAccount {
    location_id: number;
    account_id: number;
    type: string;
    claim_code: string;
}
