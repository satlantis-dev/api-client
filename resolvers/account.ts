import { type NostrEvent, NostrKind, PublicKey, SingleRelayConnection } from "@blowater/nostr-sdk";
import type { Account, Client, Kind0MetaData } from "../sdk.ts";

export class AccountResolver {
    metadata: Kind0MetaData;
    createdAt: Date;
    private client: Client;

    public readonly source:
        | {
            type: "nostr";
            data: NostrEvent;
        }
        | {
            type: "backend";
            data: Account;
        };

    constructor(
        client: Client,
        source: {
            type: "nostr";
            data: NostrEvent;
        },
    ) {
        this.client = client;
        this.source = source;
        this.metadata = JSON.parse(source.data.content);
        this.createdAt = new Date(source.data.created_at * 1000);
    }

    getMetadata = async (args: {
        limit: number;
        since: Date;
        pubkey: PublicKey;
    }) => {
        let metadataList: Kind0MetaData[] = [];
        {
            const relay = SingleRelayConnection.New(this.client.relay_url, {
                log: false,
            });
            if (relay instanceof Error) {
                return relay;
            }
            const stream = await relay.newSub("getMetadata", {
                authors: [args.pubkey.hex],
                kinds: [NostrKind.META_DATA],
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
                    const metadata = new AccountResolver(this.client, {
                        type: "nostr",
                        data: msg.event,
                    });
                    metadataList.push(metadata.metadata);
                } else if (msg.type == "NOTICE") {
                    console.warn(msg.note);
                }
            }
            await relay.close();
        }
        return metadataList;
    };
}
