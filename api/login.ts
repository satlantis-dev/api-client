import { NostrKind, prepareNostrEvent, type Signer } from "@blowater/nostr-sdk";

import { copyURL, handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { Account, Kind0MetaData } from "../models/account.ts";
import type { Community } from "../models/community.ts";

export type WhopMembershipNonmatch = {
    membership_id: string;
    company_id: string;
    company_title: string;
    product_id: string;
    product_title: string;
};

export type WhopAuthInfo = {
    communities: Community[];
    admin_nonmatched: WhopMembershipNonmatch[];
    member_nonmatched: WhopMembershipNonmatch[];
};

/**
 * @unstable The signature is subject to change
 */
export const loginNostr = (urlArg: URL) => async (signer: Signer, metadata?: Kind0MetaData) => {
    const url = copyURL(urlArg);
    url.pathname = `/login/nostr`;
    const stringifiedMetadata = JSON.stringify(metadata || {});
    const body = JSON.stringify(
        await prepareNostrEvent(signer, {
            kind: 27236 as NostrKind,
            content: stringifiedMetadata,
            tags: [["auth", "satlantis"]],
        }),
    );
    const response = await safeFetch(url, {
        method: "POST",
        body,
    });
    if (response instanceof Error) {
        return response;
    }
    if (response.status === 401) {
        return new Error("blacklisted");
    }
    return handleResponse<{
        token: string;
        account: Account;
        canSignNostrEvent: boolean;
    }>(response);
};

/**
 * POST /auth/apple
 * https://github.com/satlantis-dev/api/blob/dev/rest/auth.go#L876
 */
export const authApple = (urlArg: URL) => async (args: { code: string; id_token: string; state: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/auth/apple`;
    const response = await safeFetch(url, {
        method: "POST",
        body: JSON.stringify(args),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ token: string; account: Account; isNewAccount: boolean; canSignNostrEvent: boolean }>(response);
};

/**
 * POST /auth/whop
 */
export const authWhop = (urlArg: URL) => async (args: { access_token: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/auth/whop`;
    const response = await safeFetch(url, {
        method: "POST",
        body: JSON.stringify(args),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ token: string; account: Account; isNewAccount?: boolean; whop?: WhopAuthInfo; canSignNostrEvent: boolean }>(response);
};

/**
 * POST /auth/google
 */
export const authGoogle = (urlArg: URL) => async (args: { id_token: string }) => {
    const url = copyURL(urlArg);
    url.pathname = `/auth/google`;
    const response = await safeFetch(url, {
        method: "POST",
        body: JSON.stringify(args),
    });
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<{ token: string; account: Account; isNewAccount: boolean; canSignNostrEvent: boolean }>(response);
};
