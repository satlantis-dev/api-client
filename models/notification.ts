import { type AccountDTO } from "./account.ts";

export interface Notification {
    id: number;
    creatorAccountId: number;
    creatorAccount: AccountDTO;
    type: string;
    link: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}
