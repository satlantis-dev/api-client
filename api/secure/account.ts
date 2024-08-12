import { copyURL, handleResponse } from "../../helpers/_helper.ts";
import { safeFetch } from "../../helpers/safe-fetch.ts";
import { NostrKind, prepareNormalNostrEvent, Signer } from "@blowater/nostr-sdk";
import { Place } from "../place.ts";
import { AuthDetail, ChatMembership } from "../share_types.ts";

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

export const addAccountRole =
    (urlArg: URL, jwtToken: string | undefined, getSigner: () => Signer | Error) =>
    async (args: {
        placeId: number;
        type: AccountPlaceRoleTypeEnum;
    }) => {
        if (jwtToken == undefined || jwtToken == "") {
            return new Error("jwt token is empty");
        }
        const signer = getSigner();
        if (signer instanceof Error) {
            return signer;
        }
        const url = copyURL(urlArg);
        url.pathname = `/secure/addAccountRole`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(
            url,
            {
                method: "POST",
                body: JSON.stringify({
                    ...args,
                    event: await prepareNormalNostrEvent(signer, {
                        kind: 10016 as NostrKind,
                        content: "",
                    }),
                }),
                headers,
            },
        );
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<AccountPlaceRole>(response);
    };

export const removeAccountRole =
    (urlArg: URL, jwtToken: string | undefined, getSigner: () => Signer | Error) =>
    async (args: {
        placeId: number;
        type: AccountPlaceRoleTypeEnum;
    }) => {
        if (jwtToken == undefined || jwtToken == "") {
            return new Error("jwt token is empty");
        }
        const signer = getSigner();
        if (signer instanceof Error) {
            return signer;
        }
        const url = copyURL(urlArg);
        url.pathname = `/secure/removeAccountRole`;
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${jwtToken}`);
        const response = await safeFetch(
            url,
            {
                method: "DELETE",
                body: JSON.stringify({
                    ...args,
                    event: await prepareNormalNostrEvent(signer, {
                        kind: 10016 as NostrKind,
                        content: "",
                    }),
                }),
                headers,
            },
        );
        if (response instanceof Error) {
            return response;
        }
        return handleResponse<AccountPlaceRole>(response);
    };
