import { type NostrEvent, NostrKind, SingleRelayConnection } from "@blowater/nostr-sdk";
import type { AccountDTO, Client, Note, NoteType, PlaceNote } from "../sdk.ts";
import { getRawNostrEventFromNote } from "../helpers/_helper.ts";

type BEMeta = {
    noteId: number;
    noteType: NoteType;
    account: AccountDTO;
    placeId?: number;
    commentCount?: number;
    commentedByUser?: boolean;
    reactionCount?: number;
    reactedByUser?: boolean;
    source?: string;
    score?: number;
};

export class NoteResolver {
    nostrId: string;
    pubkey: string;
    content: string;
    createdAt: Date;
    nostrEvent: NostrEvent;
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
    /**
     * All additional information obtained from BE.
     * @experimental
     * @unstable
     */
    beMeta?: BEMeta;

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
        if (source.type == "nostr") {
            this.nostrId = source.data.id;
            this.pubkey = source.data.pubkey;
            this.content = source.data.content;
            this.createdAt = new Date(source.data.created_at * 1000);
            this.nostrEvent = source.data;
        } else if (source.type == "backend") {
            this.nostrId = source.data.nostrId;
            this.pubkey = source.data.pubkey;
            this.content = source.data.content;
            this.createdAt = new Date(source.data.createdAt);
            this.nostrEvent = getRawNostrEventFromNote(source.data);
            this.beMeta = {
                noteId: source.data.id,
                noteType: source.data.type,
                account: source.data.account,
                commentCount: source.data.commentCount,
                commentedByUser: source.data.commentedByUser,
                reactionCount: source.data.reactionCount,
                reactedByUser: source.data.reactedByUser,
                source: source.data.source,
                score: source.data.score,
            };
        } else {
            this.nostrId = source.data.note.nostrId;
            this.pubkey = source.data.note.pubkey;
            this.content = source.data.note.content;
            this.createdAt = new Date(source.data.note.createdAt);
            this.nostrEvent = getRawNostrEventFromNote(source.data.note);
            this.beMeta = {
                placeId: source.data.placeId,

                noteId: source.data.note.id,
                noteType: source.data.type,
                account: source.data.note.account,
                commentCount: source.data.note.commentCount,
                commentedByUser: source.data.note.commentedByUser,
                reactionCount: source.data.note.reactionCount,
                reactedByUser: source.data.note.reactedByUser,
                source: source.data.note.source,
                score: source.data.note.score,
            };
        }
    }

    getAuthor = async (options: { useCache: boolean }) => {
        const user = await this.client.resolver.getUser(this.pubkey, options);
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

    /**
     * Get place object of this note
     * @experimental
     * @unstable
     */
    getPlace = async () => {
        if (this.beMeta?.placeId) {
            const place = await this.client.getPlaceById({ id: this.beMeta.placeId }, { useCache: true });
            if (place instanceof Error) {
                return place;
            }
            return place;
        }
    };
}
