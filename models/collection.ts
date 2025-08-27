import type { AccountMiniDTO } from "@satlantis/api-client";
import type { LocationDTO } from "./location.ts";
import type { Account } from "./account.ts";

export type CollectionLocation = {
    collectionId: number;
    googleId: string;
    seqNum: number;
    blurb?: string;
    location: LocationDTO;
};

export type Collection = {
    id: number;
    accountId: number;
    account?: Account;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    locations: CollectionLocation[];
    numLocations: number;
    numSaves: number;
    contributors: AccountMiniDTO[];
    cover?: string;
    placesById: number[] | null;
    featured: boolean;
};
