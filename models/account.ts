import { AuthDetail } from "../sdk.ts";

import { ChatMembership } from "./chat.ts";
import { Place } from "./place.ts";

export type Account = {
    id: number;
    about?: string;
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

export type AccountPlaceRole = {
    id: number;
    accountId: number;
    account: Account;
    placeId: number;
    active: boolean;
    type: AccountPlaceRoleTypeEnum;
    place: Place;
};

export enum AccountPlaceRoleTypeEnum {
    FOLLOWER = 1,
    VISITOR,
    INHABITANT,
    AMBASSADOR,
}

export type AccountPlaceRating = {
    accountId: number;
    placeId: number;
    review: string;
    ratings: object;
};

export type AccountLocationRating = {
    accountId: number;
    locationId: number;
    review: string;
    ratings: object;
};

type Currency = {
    code: string;
    name: string;
    symbol: string;
};
