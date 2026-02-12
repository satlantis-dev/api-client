import type { AccountDTO } from "@satlantis/api-client";
import type { Calendar } from "./calendar.ts";

export type Community = {
    id: number;
    accountId: number;
    account?: AccountDTO;
    name: string;
    description?: string;
    banner?: string;
    newsletters?: CommunityNewsletter[];
    members?: CommunityMember[];
    calendars?: Calendar[];
};

export enum NewsletterStatus {
    DRAFT = "draft",
    SCHEDULED = "scheduled",
    SENDING = "sending",
    SENT = "sent",
    FAILED = "failed",
}

export type CommunityNewsletter = {
    id: number;
    communityId: number;
    community?: Community;
    accountId: number;
    account?: AccountDTO;
    contentJson?: JSON;
    contentHtml?: string;
    subject: string;
    status: NewsletterStatus;
    scheduledFor?: string;
    sentAt?: string;
    createdAt: string;
    updatedAt: string;
};

export type CommunityMember = {
    id: number;
    communityId: number;
    accountId: number;
    account?: AccountDTO;
};
