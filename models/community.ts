import type { AccountDTO, SearchAccountDTO } from "@satlantis/api-client";
import type { Calendar } from "./calendar.ts";

export type Community = {
    id: number;
    name: string;
    bio?: string;
    description?: string;
    banner?: string;
    accountId: number;
    account?: AccountDTO;
    faq?: CommunityFAQ[];
    socialLinks: Record<string, unknown>;
    memberCount?: number;
    tiers?: CommunityMembershipTier[];
    gallery?: CommunityGalleryImage[];
    calendars?: Calendar[];
    theme?: CommunityTheme;
    members?: CommunityMember[];
    newsletters?: CommunityNewsletter[];
    sampleMembers: SearchAccountDTO[]; // a sample top-N subset (ranked by follower count)
    logo?: string;
};

export type CommunityTheme = {
    id: number;
    name: string;
    backgroundColor: string;
    foregroundColor: string;
    rank?: number;
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
