import { Nevent, NostrAddress, NostrProfile, NoteID, PublicKey } from "@blowater/nostr-sdk";

type ItemType = "url" | "tag" | "hashtag" | "note" | "npub" | "nprofile" | "naddr" | "nevent";
export type ContentItem =
    | {
        type: "raw" | "url" | "tag" | "hashtag";
        text: string;
    }
    | {
        type: "npub";
        text: string;
        pubkey: PublicKey;
    }
    | {
        type: "nprofile";
        text: string;
        nprofile: NostrProfile;
    }
    | {
        type: "note";
        text: string;
        noteID: NoteID;
    }
    | {
        type: "naddr";
        text: string;
        addr: NostrAddress;
    }
    | {
        type: "nevent";
        text: string;
        nevent: Nevent;
    };

export function* parseContent(content: string): Iterable<ContentItem> {
    if (content.length === 0) {
        return;
    }
    const first_match = match_first(content);
    if (!first_match) {
        yield { text: content, type: "raw" };
        return;
    }

    const text = content.substring(first_match.start, first_match.end);
    const bech32 = text.startsWith("nostr:") ? text.slice(6) : text;
    const raw_string_before = content.substring(0, first_match.start);

    if (first_match.name === "npub") {
        const pubkey = PublicKey.FromBech32(bech32);
        if (pubkey instanceof Error) {
            yield {
                type: "raw",
                text: content.slice(0, first_match.end),
            };
            yield* parseContent(content.slice(first_match.end));
            return;
        } else {
            if (raw_string_before) {
                yield { text: raw_string_before, type: "raw" };
            }
            yield { text, type: first_match.name, pubkey };
            yield* parseContent(content.slice(first_match.end));
            return;
        }
    } else if (first_match.name === "nprofile") {
        const decoded_nProfile = NostrProfile.decode(bech32);
        if (decoded_nProfile instanceof Error) {
            yield {
                type: "raw",
                text: content.slice(0, first_match.end),
            };
            yield* parseContent(content.slice(first_match.end));
            return;
        } else {
            if (raw_string_before) {
                yield { text: raw_string_before, type: "raw" };
            }
            yield { text, type: first_match.name, nprofile: decoded_nProfile };
            yield* parseContent(content.slice(first_match.end));
            return;
        }
    } else if (first_match.name === "note") {
        const noteID = NoteID.FromBech32(bech32);
        if (noteID instanceof Error) {
            yield {
                type: "raw",
                text: content.slice(0, first_match.end),
            };
            yield* parseContent(content.slice(first_match.end));
            return;
        } else {
            if (raw_string_before) {
                yield { text: raw_string_before, type: "raw" };
            }
            yield { text, type: first_match.name, noteID };
            yield* parseContent(content.slice(first_match.end));
            return;
        }
    } else if (first_match.name === "naddr") {
        const addr = NostrAddress.decode(bech32);
        if (addr instanceof Error) {
            yield {
                type: "raw",
                text: content.slice(0, first_match.end),
            };
            yield* parseContent(content.slice(first_match.end));
            return;
        } else {
            if (raw_string_before) {
                yield { text: raw_string_before, type: "raw" };
            }
            yield { text, type: first_match.name, addr };
            yield* parseContent(content.slice(first_match.end));
            return;
        }
    } else if (first_match.name === "nevent") {
        const nevent = Nevent.decode(bech32);
        if (nevent instanceof Error) {
            yield {
                type: "raw",
                text: content.slice(0, first_match.end),
            };
            yield* parseContent(content.slice(first_match.end));
            return;
        } else {
            if (raw_string_before) {
                yield { text: raw_string_before, type: "raw" };
            }
            yield { text, type: first_match.name, nevent };
            yield* parseContent(content.slice(first_match.end));
            return;
        }
    } else {
        if (raw_string_before) {
            yield { text: raw_string_before, type: "raw" };
        }
        yield { text, type: first_match.name };
        yield* parseContent(content.slice(first_match.end));
    }
}

function match_first(content: string) {
    if (content.length === 0) {
        return;
    }

    const regexs: { name: ItemType; regex: RegExp }[] = [
        { name: "url", regex: /https?:\/\/[^\s]+/ },
        { name: "npub", regex: /(nostr:)?npub[0-9a-z]{59}/ },
        { name: "nprofile", regex: /(nostr:)?nprofile[0-9a-z]+/ },
        { name: "naddr", regex: /(nostr:)?naddr[0-9a-z]+/ },
        { name: "note", regex: /(nostr:)?note[0-9a-z]{59}/ },
        { name: "nevent", regex: /(nostr:)?nevent[0-9a-z]+/ },
        { name: "tag", regex: /#\[[0-9]+\]/ },
        // support latin letter and Chinese, will add other languages
        { name: "hashtag", regex: /#[\w\u4e00-\u9fff\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]+/ },
    ];

    let first_match:
        | {
            name: ItemType;
            start: number;
            end: number;
        }
        | undefined;
    for (const r of regexs) {
        const matched = r.regex.exec(content);
        if (matched == null) {
            continue;
        }
        const start = matched.index;
        const end = matched.index + matched[0].length;

        // Return the matching string with the maximum length
        if (first_match == undefined) {
            first_match = { name: r.name, start, end };
            continue;
        }
        if (start < first_match.start) {
            first_match = { name: r.name, start, end };
            continue;
        }
        if (first_match.start == start && end > first_match.end) {
            first_match = { name: r.name, start, end };
            continue;
        }
    }
    return first_match;
}

export function contentHasImages(content: string) {
    const items = parseContent(content);
    for (const item of items) {
        if (item.type == "url") {
            if (urlIsImage(item.text)) {
                return true;
            }
        }
    }
    return false;
}

export function urlIsImage(url: string) {
    const trimmed = url.trim().toLocaleLowerCase();
    const parts = trimmed.split(".");
    return ["png", "jpg", "jpeg", "gif", "webp", "tiff", "tif", "heic", "ico", "bmp"].includes(
        parts[parts.length - 1],
    );
}
