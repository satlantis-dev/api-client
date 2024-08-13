import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import { Note, NoteType } from "./note.ts";
import { BusinessStatus, NostrEvent, OpeningHours, PriceLevel, ProcessedTag } from "./share_types.ts";

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

export const getLocationTags = (urlArg: URL) => async () => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationTags`;
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<LocationTag[]>(response);
};

/**
 * @unstable
 * @param tags currently tags are not used
 */
export const getLocationsWithinBoundingBox = (urlArg: URL) =>
async (args: {
    sw_lat: number;
    sw_lng: number;
    ne_lat: number;
    ne_lng: number;
    google_rating?: number;
    search?: string;
    tag_category?: string;
    tags?: LocationTag[];
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/getLocationsWithinBoundingBox`;

    let tags = "";
    if (args.tags !== undefined) {
        const tagsArray: string[] = [];

        for (const tag of args.tags) {
            tagsArray.push(`${tag.key}-${tag.value}`);
        }

        tags = tagsArray.join(",");
    }

    url.searchParams.set("sw_lat", String(args.sw_lat));
    url.searchParams.set("sw_lng", String(args.sw_lng));
    url.searchParams.set("ne_lat", String(args.ne_lat));
    url.searchParams.set("ne_lng", String(args.ne_lng));
    if (args.google_rating) {
        url.searchParams.set("google_rating", String(args.google_rating));
    }
    if (args.tag_category) {
        url.searchParams.set("tag_category", args.tag_category);
    }
    if (tags) {
        url.searchParams.set("tags", tags);
    }
    if (args.search) {
        url.searchParams.set("search", args.search);
    }
    console.log(url.toString());
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    const x = await handleResponse<Location[]>(response);
    return x;
};
