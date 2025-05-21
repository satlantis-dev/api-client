import { type AccountDTO } from "./account.ts";

export interface Notification {
    id: number;
    creatorAccountId: number;
    creatorAccount: AccountDTO;
    action: string;
    type: string;
    imageUrl: string;
    link: string;
    message: string;
    // deno-lint-ignore no-explicit-any
    payload?: any;
    isRead: boolean;
    createdAt: Date;
}
