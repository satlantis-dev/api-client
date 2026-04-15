import type { AccountDTO } from "@satlantis/api-client";
import type { Calendar } from "./calendar.ts";

export type Community = {
    id: number;
    accountId: number;
    account?: AccountDTO;
    name: string;
    bio?: string;
    description?: string;
    banner?: string;
    newsletters?: CommunityNewsletter[];
    members?: CommunityMember[];
    memberCount?: number;
    tiers?: CommunityMembershipTier[];
    calendars?: Calendar[];
    faq?: CommunityFAQ[];
    gallery?: CommunityGalleryImage[];
    socialLinks: Record<string, unknown>;
};

export type CommunityFAQ = {
    question: string;
    answer: string;
};

export interface CommunityGalleryImage {
    id: number;
    communityId: number;
    url: string;
    rank: number;
    createdAt: string;
}

export interface CommunityMembershipTier {
    id: number;
    communityId: number;
    community?: Community;
    name: string;
    description?: string;
    rank: number;
    createdAt: string;
    updatedAt: string;
}

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
    contentJson?: Record<string, unknown>;
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
    community?: Community;
    accountId: number;
    account: AccountDTO;
    createdAt: string;
    updatedAt: string;
};
