import { type AccountDTO } from "./account.ts";

export interface Notification {
    id: number;
    creatorAccountId: number;
    creatorAccount: AccountDTO;
    action: string;
    type: string;
    link: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}
