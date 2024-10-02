import type { NostrEvent } from "@blowater/nostr-sdk";
import type { Client, Note } from "../sdk.ts";

export class NoteResolver {
    content: string;
    createdAt: Date;
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
        if (note.type == "backend") {
            this.createdAt = new Date(note.data.createdAt);
        } else {
            this.createdAt = new Date(note.data.created_at * 1000);
        }
    }

    getAuthor = async () => {
        const user = await this.client.resolver.getUser(this.source.data.pubkey);
        if (user instanceof Error) {
            return user;
        }
        return user;
    };
}
