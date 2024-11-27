import { type NostrEvent, NostrKind, SingleRelayConnection } from "@blowater/nostr-sdk";
import type { Client, Note, PlaceNote } from "../sdk.ts";

export class NoteResolver {
    nostrId: string;
    pubkey: string;
    content: string;
    createdAt: Date;
    public readonly source:
        | {
            type: "nostr";
            data: NostrEvent;
        }
        | {
            type: "backend";
            data: Note;
        }
        | {
            type: "backend-place";
            data: PlaceNote;
        };
    private client: Client;
    spaceId?: number;

    constructor(
        client: Client,
        source:
            | {
                type: "nostr";
                data: NostrEvent;
            }
            | {
                type: "backend";
                data: Note;
            }
            | {
                type: "backend-place";
                data: PlaceNote;
            },
    ) {
        this.client = client;
        this.source = source;
        if (source.type == "backend") {
            this.nostrId = source.data.nostrId;
            this.pubkey = source.data.pubkey;
            this.content = source.data.content;
            this.createdAt = new Date(source.data.createdAt);
        } else if (source.type == "nostr") {
            this.nostrId = source.data.id;
            this.pubkey = source.data.pubkey;
            this.content = source.data.content;
            this.createdAt = new Date(source.data.created_at * 1000);
        } else {
            this.nostrId = source.data.note.nostrId;
            this.pubkey = source.data.note.pubkey;
            this.content = source.data.note.content;
            this.createdAt = new Date(source.data.note.createdAt);
        }
    }

    getAuthor = async () => {
        const user = await this.client.resolver.getUser(this.pubkey);
        if (user instanceof Error) {
            return user;
        }
        return user;
    };

    /**
     * get reactions (kind 7) of this note
     * @experimental
     * @unstable parameters are subjects to changes.
     *  implementations might change
     */
    getReactions = async (args: { limit: number; since: Date }) => {
        const reactions = [];
        {
            const relay = SingleRelayConnection.New(this.client.relay_url, {
                log: false,
            });
            if (relay instanceof Error) {
                return relay;
            }
            const stream = await relay.newSub("getReactions", {
                "#e": [this.nostrId],
                kinds: [NostrKind.REACTION],
                limit: args.limit,
                since: Math.floor(args.since.valueOf() / 1000),
            });
            if (stream instanceof Error) {
                await relay.close();
                return stream;
            }
            for await (const msg of stream.chan) {
                if (msg.type == "EOSE") {
                    break;
                } else if (msg.type == "EVENT") {
                    const note = new NoteResolver(this.client, {
                        type: "nostr",
                        data: msg.event,
                    });
                    reactions.push(note);
                } else if (msg.type == "NOTICE") {
                    console.warn(msg.note);
                }
            }
            await relay.close();
        }
        return reactions;
    };

    getPlace = async () => {
        if (this.spaceId) {
            const place = await this.client.getPlaceById({ id: this.spaceId }, { useCache: true });
            if (place instanceof Error) {
                return place;
            }
            return place;
        }
    };
}
