import type { NostrEvent } from "@blowater/nostr-sdk";
import type { Client, Note } from "../sdk.ts";

export class NoteResolver {
    content: string;
    private readonly source: {
        type: "nostr";
        data: NostrEvent;
    } | {
        type: "backend";
        data: Note;
    };
    private client: Client;

    constructor(
        client: Client,
        note: {
            type: "nostr";
            data: NostrEvent;
        } | {
            type: "backend";
            data: Note;
        },
    ) {
        this.client = client;
        this.source = note;
        this.content = note.data.content;
    }

    getAuthor = async () => {
        const user = await this.client.resolver.getUser(this.source.data.pubkey);
        if (user instanceof Error) {
            return user;
        }
        return user;
    };
}
