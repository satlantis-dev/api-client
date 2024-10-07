import type { ReshapedNostrEvent } from "../api/share_types.ts";

export interface Reaction {
    id: number;
    accountId: number;
    eventId: number;
    event: ReshapedNostrEvent;
}
