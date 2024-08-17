import { PublicKey } from "@blowater/nostr-sdk";

import { handleResponse, InvalidURL, newURL } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";

export type Nip5Result = {
    readonly names: { [key: string]: string };
    readonly relays: Relays;
    readonly nip46: { [key: string]: string[] };
};

export type Relays = {};

export const getNip5 = async (args: {
    domain: string;
    name: string;
}) => {
    const url = newURL(args.domain);
    if (url instanceof InvalidURL) {
        return url;
    }
    url.pathname = `/.well-known/nostr.json`;
    url.searchParams.append("name", args.name);
    const response = await safeFetch(url);
    if (response instanceof Error) {
        return response;
    }
    const res = await handleResponse<Nip5Result>(response);
    if (res instanceof Error) {
        return res;
    }
    const key = res.names[args.name];
    if (key) {
        const pub = PublicKey.FromHex(key);
        if (pub instanceof Error) {
            return pub;
        }
        const relays = res.nip46[pub.hex];
        return {
            pubkey: pub,
            relays: relays || [],
        };
    }
    return undefined;
};
