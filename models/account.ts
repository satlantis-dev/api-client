import type { AuthDetail } from "../sdk.ts";

import type { ChatMembership } from "./chat.ts";
import type { Place } from "./place.ts";

export type Account = {
  id: number;
  about?: string;
  following: AccountDTO[];
  followedBy: AccountDTO[];
  followingCount?: number;
  followersCount?: number;
  followsCurrentAccount?: boolean;
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
  username?: string;
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
  socialLinks: AccountSocialLinks;
};

// https://github.com/satlantis-dev/models/blob/main/account.go#L92
export type AccountDTO = {
  id: number;
  about: string;
  displayName: string;
  isAdmin: boolean;
  isBusiness: boolean;
  name: string;
  nip05: string;
  npub: string;
  picture: string;
  pubKey: string;
  username: string;
  banner: string;
  followersCount: number | null;
  followingCount: number | null;
  followsCurrentAccount?: boolean;
  isBlacklisted: boolean;
  website: string;
  vertexRank: string;
  email: string;
};

export type AccountMiniDTO = {
  id: number;
  username: string;
  displayName: string;
  name: string;
  nip05: string;
  picture: string;
  npub: string;
  pubKey: string;
};

export type AccountSearchDTO = {
  id: number;
  username: string;
  display_name: string;
  followers_count: number;
  following_count: number;
  name: string;
  nip05: string;
  about: string;
  picture: string;
  npub: string;
};

export type AccountPlaceRole = {
  id: number;
  accountId: number;
  account: AccountDTO;
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
  username?: string;
  lud06?: string;
  lud16?: string;
  nip05?: string;
  picture?: string;
  website?: string;
  npub?: string;
  /**
   * @deprecated remove after Oct 25
   */
  phone?: string;
  /**
   * @deprecated remove after Oct 25
   */
  email?: string;
};

export type SearchAccountDTO = {
  id: number;
  username?: string;
  display_name?: string;
  followers_count: number;
  following_count: number;
  name?: string;
  nip05?: string;
  about?: string;
  picture?: string;
  npub: string;
};

export type AccountSocialLinks = {
  facebook?: string;
  x?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
};
