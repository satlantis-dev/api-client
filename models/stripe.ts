export enum StripeAccountStatus {
    PENDING = "pending",
    ACTIVE = "active",
    RESTRICTED = "restricted",
    DISABLED = "disabled",
}

export type StripeAccount = {
    "id": number;
    "stripeAccountId": string;
    "status": StripeAccountStatus;
    "chargesEnabled": boolean;
    "payoutsEnabled": boolean;
    "detailsSubmitted": boolean;
    "defaultCurrency": string;
    "country": string;
    "email": string;
    "isDefault": boolean;
    "connectedAt": string; // timestamp
};
