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

// https://www.figma.com/design/LlT3G00nTiN02jexQo6rt2/Satlantis-%3A%3A-UI-UX?node-id=420-12198&node-type=frame&t=LHwJbZk3Tm0FWi4i-0
export type Kind0MetaData = {
    about?: string;
    banner?: string;
    name?: string;
    displayName?: string;
    lud06?: string;
    lud16?: string;
    picture?: string;
    website?: string;
    phone?: string;
    email?: string;
};
