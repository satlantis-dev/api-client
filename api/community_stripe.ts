import { safeFetch } from "../helpers/safe-fetch.ts";
import { createSecureUrl, handleResponse } from "../helpers/util.ts";
import type { StripeAccount } from "../models/stripe.ts";
import type { func_GetJwt } from "../sdk.ts";

export type CommunityStripeConnectionState = "not_connected" | "incomplete" | "connected";

export type CommunityStripeStatus = {
    state: CommunityStripeConnectionState;
    // Omitted by the API when state is "not_connected".
    stripeAccount?: StripeAccount;
    isOrganizer: boolean;
};

export type GetCommunityStripeStatusArgs = {
    communityId: number;
};

export function getCommunityStripeStatus(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: GetCommunityStripeStatusArgs) => {
        const url = createSecureUrl(urlArg, `/communities/${args.communityId}/stripe/status`);

        const jwtToken = getJwt();
        const headers = new Headers();

        if (!jwtToken) return new Error("jwt token is empty");

        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<CommunityStripeStatus>(response);
    };
}

export type ConnectCommunityStripeAccountArgs = {
    communityId: number;
    redirectUrl: string;
    confirmReplace?: boolean;
};

export type ConnectCommunityStripeAccountResponse = {
    oauthUrl: string;
};

export function connectCommunityStripeAccount(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: ConnectCommunityStripeAccountArgs) => {
        const url = createSecureUrl(
            urlArg,
            `/communities/${args.communityId}/stripe/connect/authorize`,
        );
        url.searchParams.set("redirect_url", args.redirectUrl);
        if (args.confirmReplace) {
            url.searchParams.set("confirm_replace", "true");
        }

        const jwtToken = getJwt();
        const headers = new Headers();

        if (!jwtToken) return new Error("jwt token is empty");

        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "GET",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<ConnectCommunityStripeAccountResponse>(response);
    };
}

export type LinkStripeAccountToCommunityArgs = {
    communityId: number;
    // StripeAccount.id (the connect record id), not stripeAccountId.
    accountStripeConnectId: number;
    confirmReplace?: boolean;
};

export function linkStripeAccountToCommunity(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: LinkStripeAccountToCommunityArgs) => {
        const url = createSecureUrl(urlArg, `/communities/${args.communityId}/stripe`);

        const jwtToken = getJwt();
        const headers = new Headers();

        if (!jwtToken) return new Error("jwt token is empty");

        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify({
                accountStripeConnectId: args.accountStripeConnectId,
                confirmReplace: args.confirmReplace ?? false,
            }),
        });

        if (response instanceof Error) return response;
        return handleResponse<CommunityStripeStatus>(response);
    };
}

export type UnlinkStripeAccountFromCommunityArgs = {
    communityId: number;
};

export type UnlinkStripeAccountFromCommunityResponse = {
    success: boolean;
};

export function unlinkStripeAccountFromCommunity(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: UnlinkStripeAccountFromCommunityArgs) => {
        const url = createSecureUrl(urlArg, `/communities/${args.communityId}/stripe`);

        const jwtToken = getJwt();
        const headers = new Headers();

        if (!jwtToken) return new Error("jwt token is empty");

        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "DELETE",
            headers,
        });

        if (response instanceof Error) return response;
        return handleResponse<UnlinkStripeAccountFromCommunityResponse>(response);
    };
}
