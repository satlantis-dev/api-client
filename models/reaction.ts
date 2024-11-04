import type { Account } from "./account.ts";

export interface Reaction {
    id: number;
    accountId: number;
    eventId: number;
    account?: Account;
}
