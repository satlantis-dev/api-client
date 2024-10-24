import type { AuthDetail } from "../sdk.ts";

import type { ChatMembership } from "./chat.ts";
import type { Place } from "./place.ts";

export type Account = {
    id: number;
    about?: string;
    following: Account_Base[];
    followedBy: Account_Base[];
    npub: string;
    pubKey: string;
    accountPlaceRoles?: AccountPlaceRole[];
    authDetails?: AuthDetail[];
    banner?: string;
    businessCategory?: string;
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
    locations?: {
        id: number;
        accountId: number;
        claimCode: string;
        location: Location;
        locationId: number;
        referredBy: string;
        type: "owner";
    }[];
};

type Account_Base = {
    id: number;
    about: string;
    isAdmin: boolean;
    isBusiness: boolean;
    name: string;
    nip05: string;
    npub: string;
    picture: string;
    pubKey: string;
};

export type AccountPlaceRole = {
    id: number;
    accountId: number;
    /**
     * @deprecated prefer to getting the user/account by calling APIs
     */
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

export type Kind0MetaData = {
    about?: string;
    banner?: string;
    name?: string;
    displayName?: string;
    lud06?: string;
    lud16?: string;
    picture?: string;
    website?: string;
    /**
     * @deprecated remove after Oct 25
     */
    phone?: string;
    /**
     * @deprecated remove after Oct 25
     */
    email?: string;
};
