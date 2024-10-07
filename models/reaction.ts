import type { ReshapedNostrEvent } from "../api/share_types";

export interface Reaction {
    id: number;
    accountId: number;
    eventId: number;
    event: ReshapedNostrEvent;
}
