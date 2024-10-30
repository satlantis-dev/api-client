export type Interest = {
    readonly id: number;
    readonly name: string;
    readonly description: string;
    readonly recommendationsByNpub: string[] | null | undefined;
    readonly recommendationsById: null | undefined;
    readonly autofollowsByNpub: string[] | null | undefined;
    readonly autofollowsById: null | undefined;
    readonly hashtags: string[] | null | undefined;
};
