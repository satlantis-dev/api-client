export type VanityPath = {
    readonly id: number;
    readonly path: string;
    readonly objectType: VanityObjectType;
    readonly objectRef: string;
};

export enum VanityObjectType {
    Account = "account",
    Note = "note",
    Destination = "destination",
    Collection = "collection",
    Location = "location",
    Calendar = "calendar",
    Event = "event",
}
