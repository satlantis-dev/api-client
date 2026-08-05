export type SystemVersion = {
    id: number;
    platform: "ios" | "android";
    minVersion: string;
};

export type CommunityBannerImage = {
    id?: number | string;
    url: string;
    category?: string;
    name?: string;
    keywords?: string[] | string;
    [metadata: string]: unknown;
};

/**
 * Curated community banners grouped by their display category.
 *
 * The API originally specified URL strings, while its current response uses
 * banner objects. Supporting both keeps clients compatible during rollout.
 */
export type CommunityBannerCatalog = Record<
    string,
    Array<string | CommunityBannerImage>
>;
