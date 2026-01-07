import type { AccountDTO } from "@satlantis/api-client";

export type OnboardingProfile = {
    accountId: number;
    createdAt: string;
    updatedAt: string;
    account?: AccountDTO;
    isHost?: boolean;
    suggestedGoogleIds?: string[];
    interestStatement?: string;
    inferredInterests?: string[];
    inferredInterestIds?: number[];
};
