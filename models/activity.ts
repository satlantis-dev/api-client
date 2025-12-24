export type ActivityAction =
  // Account related
  | "updated_account"
  | "followed_account"
  // Note related
  | "created_note"
  | "reposted_note"
  | "replied_to_note"
  | "liked_note"
  // Destination related
  | "followed_destination"
  // Collection related
  | "created_collection"
  | "saved_collection"
  // Location related
  | "suggested_location"
  | "claimed_location"
  | "reviewed_location"
  | "bookmarked_location"
  // Calendar related
  | "created_calendar"
  // Event related
  | "created_event"
  | "updated_event"
  | "rsvped_to_event"
  | "bookmarked_event";

export type Activity = {
  id: number;
  accountId: number;
  objectType: "location" | "event" | "account" | string;
  objectId: number | null;
  action: ActivityAction;
  details?: any;
  createdAt: string;
};
