export type CollectionLocation = {
    collectionId: number;
    googleId: string;
    seqNum: number;
    blurb?: string;
};

export type Collection = {
    id: number;
    accountId: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    locations: CollectionLocation[];
    numLocations: number;
    numSaves: number;
    cover?: string;
};
