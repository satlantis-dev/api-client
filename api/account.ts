import { copyURL, handleResponse } from "../_helper.ts";
import { safeFetch } from "../safe-fetch.ts";
import { AccountPlaceRole, AccountPlaceRoleTypeEnum } from "./share_types.ts";
import { NostrEvent } from "@blowater/nostr-sdk";

export const deleteAccountRole = (urlArg: URL, jwtToken: string) =>
async (args: {
    placeID: number;
    type: AccountPlaceRoleTypeEnum;
    event?: NostrEvent;
}) => {
    const url = copyURL(urlArg);
    url.pathname = `/account/account-role`;
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${jwtToken}`);
    const response = await safeFetch(
        url,
        {
            method: "DELETE",
            body: JSON.stringify(args),
            headers,
        },
    );
    if (response instanceof Error) {
        return response;
    }
    return handleResponse<AccountPlaceRole>(response);
};
