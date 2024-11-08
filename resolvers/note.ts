import { type NostrEvent, NostrKind, SingleRelayConnection } from "@blowater/nostr-sdk";
import type { Client, Note } from "../sdk.ts";

export class NoteResolver {
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
        };
    private client: Client;

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
            },
    ) {
        this.client = client;
        this.source = source;
        this.content = source.data.content;
        if (source.type == "backend") {
            this.createdAt = new Date(source.data.createdAt);
        } else {
            this.createdAt = new Date(source.data.created_at * 1000);
        }
    }

    getAuthor = async () => {
        const user = await this.client.resolver.getUser(this.source.data.pubkey);
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
                "#e": [
                    this.source.type == "nostr" ? this.source.data.id : this.source.data.nostrId,
                ],
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
}
