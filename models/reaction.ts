import type { AccountDTO } from "./account.ts";

export interface Reaction {
    id: number;
    accountId: number;
    eventId: number;
    account?: AccountDTO;
}
