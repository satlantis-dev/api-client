// A subscription plan returned by `GET /plans`. Monetary amounts are in minor currency units.
export type Plan = {
    readonly id: number;
    readonly name: string;
    readonly currency: string;
    readonly monthlyAmount?: number;
    readonly yearlyAmount?: number;
    readonly btcDiscountPercentage?: number;
    readonly rank: number;
    readonly trialDays: number;
    readonly isPaid: boolean;
    readonly isHidden: boolean;
    readonly isActive: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
};
