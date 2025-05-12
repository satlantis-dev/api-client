import type { LocationTag } from "./location.ts";

// https://github.com/satlantis-dev/models/blob/main/interest.go#L19
export type Interest = {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly recommendationsByNpub: string[] | null | undefined;
  readonly recommendationsById: null | undefined;
  readonly autofollowsByNpub: string[] | null | undefined;
  readonly autofollowsById: null | undefined;
  readonly hashtags: string[] | null | undefined;
  readonly locationTags: LocationTag[];
  readonly category: InterestCategory;
  readonly contentUse: boolean;
  readonly locationUse: boolean;
  readonly eventUse: boolean;
  readonly peopleUse: boolean;
  readonly section: string;
};

export enum InterestCategory {
  GeneralInterest = 1,
  LocationInterest,
  ActivityInterest,
  FoodInterest,
  NicheInterest,
}
