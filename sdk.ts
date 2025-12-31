import {
  type Encrypter,
  type NostrEvent,
  NostrKind,
  NoteID,
  prepareEncryptedNostrEvent,
  prepareNostrEvent,
  PublicKey,
  type RelayResponse_REQ_Message,
  type Signer,
  SingleRelayConnection,
  type Tag,
} from "@blowater/nostr-sdk";

import {
  checkUsernameAvailabilityInSatlantis,
  createAccount,
  getAccount,
  getAccountActivities,
  getAccountById,
  getAccountCalendarEvents,
  getAccountFollowers,
  getAccountFollowings,
  getAllUserEvents,
  getEventsByAccount,
  initiatePasswordReset,
  login,
  resetPassword,
  sendEventSignup,
  sendOTP,
  verifyEmail,
  verifyOTP,
} from "./api/account.ts";
import { getIpInfo } from "./api/ip.ts";
import {
  claimLocation,
  getAccountRolesForLocation,
  getAccountsForLocation,
  getLocation,
  getLocationByGoogleId,
  getLocationGalleryImages,
  getLocationLinks,
  getLocationReviews,
  getLocationsByPlaceID,
  getLocationsByPlaceIDRandomized,
  getLocationsBySearch,
  getLocationsWithinBoundingBox,
  getLocationTags,
  getLocationTagsByPlaceID,
  getLocationTagsV2,
  getNearbyLocations,
  getSimilarLocations,
  proveLocationClaim,
  suggestLocation,
  updateLocation,
} from "./api/location.ts";
import { authApple, authGoogle, loginNostr } from "./api/login.ts";
import {
  buildGlobalFeed,
  getNote,
  getNoteByNostrId,
  getNoteCommentsById,
  getNoteReactionsById,
  getNotes,
  getNotesOfPubkey,
  NoteType,
} from "./api/note.ts";
import { getAccountPlaceRoles } from "./api/people.ts";
import {
  getAllPlaceRegionCountryNames,
  getCalendarEventTypes,
  getPlaceById,
  getPlaceByOsmRef,
  getPlaceCalendarEvents,
  getPlaceCategoryScores,
  getPlaceChats,
  getPlaceEvent,
  getPlaceGalleryImages,
  getPlaceMetrics,
  getPlaceNames,
  getPlaceNotes,
  getPlaces,
  getPlacesMinimal,
  getRegion,
} from "./api/place.ts";
import {
  addAccountRole,
  blacklistAccount,
  blockAccount,
  checkBlockStatus,
  deleteAccount,
  followTierZeroPlaces,
  getAccountsBySearch,
  getBlockedAccounts,
  getFollowedByAccounts,
  getMutedAccounts,
  getUserAccount,
  getUserFollowers,
  muteAccount,
  removeAccountRole,
  reportContent,
  resendEmailVerification,
  saveDeviceInfo,
  unblockAccount,
  unmuteAccount,
  updateAccount,
  updateAccountEmail,
  updateAccountFollowingList,
  getUserActivities,
  updateAdditionalPictures,
} from "./api/secure/account.ts";
import { getSystemBanners } from "./api/system.ts";
import {
  deletePlaceGalleryImage,
  postPlaceGalleryImage,
  updatePlace,
} from "./api/secure/place.ts";
import {
  deleteNote,
  postNote,
  postReaction,
  recordNotesAsSeen,
} from "./api/secure/note.ts";
import { getNotifications } from "./api/secure/notification.ts";
import { presign } from "./api/secure/presign.ts";
import { generateUUID, newURL } from "./helpers/_helper.ts";
import {
  addressLookup,
  getCoordinatesByAddress,
  getCoordinatesByGoogleId,
} from "./api/address.ts";
import { signEvent } from "./api/nostr_event.ts";
import {
  createInterests,
  getAccountInterests,
  getInterestImages,
  getInterests,
  getRecommendedFollows,
  searchInterestImages,
} from "./api/secure/interests.ts";
import {
  addEventToCalendar,
  approveEventSubmission,
  createCalendar,
  declineEventSubmission,
  deleteCalendar,
  deletePlaceCalendarEvent,
  deletePlaceCalendarEventById,
  downloadCalendarEventAttendees,
  downloadCalendarEventIcsFile,
  editCalendar,
  getCalendarByID,
  getCalendarsByAccount,
  getCalendarsRandomized,
  getCalendarSubscribers,
  getEventById,
  getEventsFromCalendar,
  getEventSubmissions,
  getFeaturedCalendars,
  getNewestCalendars,
  getPopularCalendars,
  getRecommendedCalendars,
  getUserCalendarSubscriptions,
  importEventFromUrl,
  isSubscribedToCalendar,
  markCalendarAsFeatured,
  postCalendarEventAnnouncement,
  postCalendarEventAnnouncementV2,
  postCalendarEventNote,
  postCalendarEventRSVP,
  postPlaceCalendarEvent,
  putUpdateCalendarEvent,
  relistCalendarEvent,
  removeEventFromCalendar,
  respondCalendarEventCohostInvitation,
  searchAccountViaEmail,
  searchCalendars,
  sendCohostEmailInviteToCalendarEvent,
  setOfficialCalendarToEvent,
  submitEventToCalendar,
  subscribeToCalendar,
  unlistCalendarEvent,
  unmarkCalendarAsFeatured,
  unsetOfficialCalendarFromEvent,
  unsubscribeFromCalendar,
} from "./api/secure/calendar.ts";
import {
  followPubkeys,
  getFollowingPubkeys,
  getInterestsOf,
  unfollowPubkeys,
} from "./nostr-helpers.ts";
import { getPubkeyByNip05 } from "./api/nip5.ts";
import { safeFetch } from "./helpers/safe-fetch.ts";
import type { Account, AccountDTO, Kind0MetaData } from "./models/account.ts";
import { UserResolver } from "./resolvers/user.ts";
import { LocationResolver } from "./resolvers/location.ts";
import { NoteResolver } from "./resolvers/note.ts";
import type { Place } from "./models/place.ts";
import type {
  ImageCategory,
  LocationCategory,
  LocationCategoryName,
  LocationTag,
} from "./models/location.ts";
import { postAmbassadorInquiry } from "./api/secure/ambassador.ts";
import type { Interest } from "./models/interest.ts";
import { getBrands, getExchangeRate } from "./api/metric.ts";
import {
  deleteLocationGalleryImage,
  getGlobalLocations,
  getNewestPlaces,
  getRandomizedPlaces,
  getRecommendedLocations,
  getRecommendedLocationsGlobal,
  getRecommendedPlaces,
  postLocationGalleryImage,
  promoteLocationGalleryImageToBanner,
  reportLocation,
  updateLocationGalleryImage,
} from "./api/secure/location.ts";
import {
  acceptInvitationToCollection,
  addLocationToCollections,
  addViewerToCollection,
  canEditCollection,
  createCollection,
  declineInvitationToCollection,
  deleteCollection,
  editCollection,
  getAccountCollections,
  getCollectionById,
  getCollectionSaves,
  getCollectionViewers,
  getCollectors,
  getFeaturedCollections,
  getNewestCollections,
  getPopularCollections,
  getRecommendedCollections,
  getUserCollections,
  getUserCollectionsForLocation,
  importGoogleMapsCollection,
  inviteContributorToCollection,
  markCollectionAsFeatured,
  removeContributorFromCollection,
  removeLocationFromCollections,
  removeViewerFromCollection,
  saveCollection,
  searchCollections,
  unmarkCollectionAsFeatured,
  unsaveCollection,
  updateCollectionLocation,
  updateLocationCollections,
} from "./api/secure/collections.ts";
import { mapUserToDestination } from "./api/location.ts";

import {
  assignTicketToRSVP,
  createCalendarEventTag,
  createEventTicketType,
  deleteEventTicketType,
  getCalendarEventTags,
  getEventAttendees,
  getEventCalendars,
  getEventDetails,
  getEventFinancialsSummary,
  getEventFinancialsWithdrawalFeeEstimations,
  getEventFinancialsWithdrawalStatus,
  getEventRsvps,
  getEvents,
  getEventsContacts,
  getEventTicketPaymentStatus,
  getEventTicketTypes,
  getEventTicketWithdrawalFee,
  getEventUserFinancialTimeline,
  getFeaturedEvents,
  getNewestEvents,
  getPopularEvents,
  getRandomizedEvents,
  getRecommendedCalendarEventTags,
  getRecommendedEvents,
  inviteAttendees,
  markCalendarEventAsFeatured,
  postEventFinancialsWithdraw,
  purchaseEventTicket,
  removeTicketFromUser,
  saveRegistrationQuestions,
  unmarkCalendarEventAsFeatured,
  updateEventTicketStatus,
  updateEventTicketType,
  updateRsvpStatus,
  type EventDetails,
} from "./api/events.ts";

import {
  createReceiveInvoice,
  decodeInvoice,
  estimatePaymentFee,
  getTransactionDetails,
  getTransactionHistory,
  getWallet,
  getWalletExchangeRate,
  sendPayment,
} from "./api/secure/wallet.ts";
import { getTimezoneInfo } from "./api/base.ts";
import { getVanityPathMapping } from "./api/vanity.ts";
import {
  getRefundFeeEstimation,
  getRefundStatus,
  getSingleOrderHistory,
  refundOrder,
} from "./api/secure/order.ts";

export type func_GetNostrSigner = () => Promise<(Signer & Encrypter) | Error>;
export type func_GetJwt = () => string;

export class Client {
  // Caches
  private me: UserResolver | undefined = undefined;
  private users = new Map<string, UserResolver>();
  private accounts = new Map<string, Account>();
  private places = new Map<number | string, Place>();

  getTimezoneInfo: ReturnType<typeof getTimezoneInfo>;

  // Place
  private _getPlaceNames: ReturnType<typeof getPlaceNames>;
  private _getAllPlaceRegionCountryNames: ReturnType<
    typeof getAllPlaceRegionCountryNames
  >;
  getAccountPlaceRoles: ReturnType<typeof getAccountPlaceRoles>;
  private _getPlaceByOsmRef: ReturnType<typeof getPlaceByOsmRef>;
  private _getPlaceById: ReturnType<typeof getPlaceById>;
  private _getPlaces: ReturnType<typeof getPlaces>;
  getPlaceEvent: ReturnType<typeof getPlaceEvent>;
  getPlaceNotes: ReturnType<typeof getPlaceNotes>;
  getPlaceMetrics: ReturnType<typeof getPlaceMetrics>;
  getPlaceChats: ReturnType<typeof getPlaceChats>;
  getPlaceCategoryScores: ReturnType<typeof getPlaceCategoryScores>;
  getPlaceGalleryImages: ReturnType<typeof getPlaceGalleryImages>;
  postPlaceGalleryImage: ReturnType<typeof postPlaceGalleryImage>;
  deletePlaceGalleryImage: ReturnType<typeof deletePlaceGalleryImage>;

  getRegion: ReturnType<typeof getRegion>;
  getBrands: ReturnType<typeof getBrands>;
  getExchangeRate: ReturnType<typeof getExchangeRate>;

  // Check username availability in Satlantis
  checkUsernameAvailabilityInSatlantis: ReturnType<
    typeof checkUsernameAvailabilityInSatlantis
  >;

  // Event Details getEventDetails
  getEventDetails: ReturnType<typeof getEventDetails>;
  // Calendar Events
  getEvents: ReturnType<typeof getEvents>;
  getEventCalendars: ReturnType<typeof getEventCalendars>;
  getEventRsvps: ReturnType<typeof getEventRsvps>;
  getEventAttendees: ReturnType<typeof getEventAttendees>;
  updateRsvpStatus: ReturnType<typeof updateRsvpStatus>;
  getRandomizedEvents: ReturnType<typeof getRandomizedEvents>;
  getPopularEvents: ReturnType<typeof getPopularEvents>;
  getNewestEvents: ReturnType<typeof getNewestEvents>;
  getFeaturedEvents: ReturnType<typeof getFeaturedEvents>;
  getRecommendedEvents: ReturnType<typeof getRecommendedEvents>;
  getEventById: ReturnType<typeof getEventById>;
  getPlaceCalendarEvents: ReturnType<typeof getPlaceCalendarEvents>;
  deletePlaceCalendarEvent: ReturnType<typeof deletePlaceCalendarEvent>;
  deletePlaceCalendarEventById: ReturnType<typeof deletePlaceCalendarEventById>;
  postCalendarEventRSVP: ReturnType<typeof postCalendarEventRSVP>;
  postPlaceCalendarEvent: ReturnType<typeof postPlaceCalendarEvent>;
  postCalendarEventAnnouncement: ReturnType<
    typeof postCalendarEventAnnouncement
  >;
  postCalendarEventAnnouncementV2: ReturnType<
    typeof postCalendarEventAnnouncementV2
  >;
  postCalendarEventNote: ReturnType<typeof postCalendarEventNote>;
  putUpdateCalendarEvent: ReturnType<typeof putUpdateCalendarEvent>;
  relistCalendarEvent: ReturnType<typeof relistCalendarEvent>;
  unlistCalendarEvent: ReturnType<typeof unlistCalendarEvent>;
  respondCalendarEventCohostInvitation: ReturnType<
    typeof respondCalendarEventCohostInvitation
  >;
  getAccountCalendarEvents: ReturnType<typeof getAccountCalendarEvents>;
  getCalendarEventTypes: ReturnType<typeof getCalendarEventTypes>;
  downloadCalendarEventAttendees: ReturnType<
    typeof downloadCalendarEventAttendees
  >;
  downloadCalendarEventIcsFile: ReturnType<typeof downloadCalendarEventIcsFile>;
  saveRegistrationQuestions: ReturnType<typeof saveRegistrationQuestions>;
  unmarkCalendarEventAsFeatured: ReturnType<
    typeof unmarkCalendarEventAsFeatured
  >;
  markCalendarEventAsFeatured: ReturnType<typeof markCalendarEventAsFeatured>;
  inviteAttendees: ReturnType<typeof inviteAttendees>;
  createEventTicketType: ReturnType<typeof createEventTicketType>;
  updateEventTicketType: ReturnType<typeof updateEventTicketType>;
  updateEventTicketStatus: ReturnType<typeof updateEventTicketStatus>;
  deleteEventTicketType: ReturnType<typeof deleteEventTicketType>;
  getEventTicketTypes: ReturnType<typeof getEventTicketTypes>;
  purchaseEventTicket: ReturnType<typeof purchaseEventTicket>;
  getEventTicketPaymentStatus: ReturnType<typeof getEventTicketPaymentStatus>;
  assignTicketToRSVP: ReturnType<typeof assignTicketToRSVP>;
  removeTicketFromUser: ReturnType<typeof removeTicketFromUser>;
  getEventFinancialsSummary: ReturnType<typeof getEventFinancialsSummary>;
  getEventTicketWithdrawalFee: ReturnType<typeof getEventTicketWithdrawalFee>;
  getEventFinancialsWithdrawalStatus: ReturnType<
    typeof getEventFinancialsWithdrawalStatus
  >;
  postEventFinancialsWithdraw: ReturnType<typeof postEventFinancialsWithdraw>;
  getEventFinancialsWithdrawalFeeEstimations: ReturnType<
    typeof getEventFinancialsWithdrawalFeeEstimations
  >;
  createCalendar: ReturnType<typeof createCalendar>;
  editCalendar: ReturnType<typeof editCalendar>;
  deleteCalendar: ReturnType<typeof deleteCalendar>;
  addEventToCalendar: ReturnType<typeof addEventToCalendar>;
  removeEventFromCalendar: ReturnType<typeof removeEventFromCalendar>;
  setOfficialCalendarToEvent: ReturnType<typeof setOfficialCalendarToEvent>;
  unsetOfficialCalendarFromEvent: ReturnType<
    typeof unsetOfficialCalendarFromEvent
  >;
  getCalendarByID: ReturnType<typeof getCalendarByID>;
  submitEventToCalendar: ReturnType<typeof submitEventToCalendar>;
  approveEventSubmission: ReturnType<typeof approveEventSubmission>;
  declineEventSubmission: ReturnType<typeof declineEventSubmission>;
  getEventSubmissions: ReturnType<typeof getEventSubmissions>;
  importEventFromUrl: ReturnType<typeof importEventFromUrl>;
  subscribeToCalendar: ReturnType<typeof subscribeToCalendar>;
  unsubscribeFromCalendar: ReturnType<typeof unsubscribeFromCalendar>;
  isSubscribedToCalendar: ReturnType<typeof isSubscribedToCalendar>;
  getUserCalendarSubscriptions: ReturnType<typeof getUserCalendarSubscriptions>;
  getCalendarSubscribers: ReturnType<typeof getCalendarSubscribers>;
  getEventsContacts: ReturnType<typeof getEventsContacts>;
  markCalendarAsFeatured: ReturnType<typeof markCalendarAsFeatured>;
  unmarkCalendarAsFeatured: ReturnType<typeof unmarkCalendarAsFeatured>;
  getCalendarEventTags: ReturnType<typeof getCalendarEventTags>;
  getRecommendedCalendarEventTags: ReturnType<
    typeof getRecommendedCalendarEventTags
  >;
  createCalendarEventTag: ReturnType<typeof createCalendarEventTag>;
  getFeaturedCalendars: ReturnType<typeof getFeaturedCalendars>;
  getNewestCalendars: ReturnType<typeof getNewestCalendars>;
  getPopularCalendars: ReturnType<typeof getPopularCalendars>;
  getRecommendedCalendars: ReturnType<typeof getRecommendedCalendars>;
  searchCalendars: ReturnType<typeof searchCalendars>;
  getCalendarsRandomized: ReturnType<typeof getCalendarsRandomized>;
  getEventsFromCalendar: ReturnType<typeof getEventsFromCalendar>;

  // Account
  /**
   * @unstable
   */
  private _getAccount: ReturnType<typeof getAccount>;
  private _getAccountFollowings: ReturnType<typeof getAccountFollowings>;
  private _getAccountFollowers: ReturnType<typeof getAccountFollowers>;
  getAccountsBySearch: ReturnType<typeof getAccountsBySearch>;
  searchAccountViaEmail: ReturnType<typeof searchAccountViaEmail>;
  sendCohostEmailInviteToCalendarEvent: ReturnType<
    typeof sendCohostEmailInviteToCalendarEvent
  >;
  getCalendarsByAccount: ReturnType<typeof getCalendarsByAccount>;
  getEventsByAccount: ReturnType<typeof getEventsByAccount>;
  getAllUserEvents: ReturnType<typeof getAllUserEvents>;
  createAccount: ReturnType<typeof createAccount>;
  /**
   * @unstable
   */
  private updateAccount: ReturnType<typeof updateAccount>;
  deleteAccount: ReturnType<typeof deleteAccount>;
  _blackListAccount: ReturnType<typeof blacklistAccount>;
  blacklistAccountWithNpub: ReturnType<typeof blacklistAccount>;
  getUserFollowers: ReturnType<typeof getUserFollowers>;
  getAccountActivities: ReturnType<typeof getAccountActivities>;
  getUserActivities: ReturnType<typeof getUserActivities>;
  updateAdditionalPictures: ReturnType<typeof updateAdditionalPictures>;
  getSystemBanners: ReturnType<typeof getSystemBanners>;

  // note
  private getNotesOfPubkey: ReturnType<typeof getNotesOfPubkey>;
  private getNotes: ReturnType<typeof getNotes>;
  private buildGlobalFeed: ReturnType<typeof buildGlobalFeed>;
  getNote: ReturnType<typeof getNote>;
  getNoteByNostrId: ReturnType<typeof getNoteByNostrId>;
  getIpInfo: ReturnType<typeof getIpInfo>;
  getNoteReactionsById: ReturnType<typeof getNoteReactionsById>;
  getNoteCommentsById: ReturnType<typeof getNoteCommentsById>;

  // Notifications
  getNotifications: ReturnType<typeof getNotifications>;

  // Wallet
  getWallet: ReturnType<typeof getWallet>;
  createReceiveInvoice: ReturnType<typeof createReceiveInvoice>;
  sendPayment: ReturnType<typeof sendPayment>;
  estimatePaymentFee: ReturnType<typeof estimatePaymentFee>;
  getTransactionHistory: ReturnType<typeof getTransactionHistory>;
  getTransactionDetails: ReturnType<typeof getTransactionDetails>;
  decodeInvoice: ReturnType<typeof decodeInvoice>;
  getWalletExchangeRate: ReturnType<typeof getWalletExchangeRate>;

  // Location
  getLocationsWithinBoundingBox: ReturnType<
    typeof getLocationsWithinBoundingBox
  >;
  getLocationReviews: ReturnType<typeof getLocationReviews>;
  suggestLocation: ReturnType<typeof suggestLocation>;
  getLocationByID: ReturnType<typeof getLocation>;
  getLocationByGoogleId: ReturnType<typeof getLocationByGoogleId>;
  getLocationsByPlaceID: ReturnType<typeof getLocationsByPlaceID>;
  getNearbyLocations: ReturnType<typeof getNearbyLocations>;
  private _claimLocation: ReturnType<typeof claimLocation>;
  proveLocationClaim: ReturnType<typeof proveLocationClaim>;
  updateLocation: ReturnType<typeof updateLocation>;
  private getAccountsForLocation: ReturnType<typeof getAccountsForLocation>;
  getLocationGalleryImages: ReturnType<typeof getLocationGalleryImages>;
  private _postLocationGalleryImage: ReturnType<
    typeof postLocationGalleryImage
  >;
  updateLocationGalleryImage: ReturnType<typeof updateLocationGalleryImage>;
  getGlobalLocations: ReturnType<typeof getGlobalLocations>;
  deleteLocationGalleryImage: ReturnType<typeof deleteLocationGalleryImage>;
  promoteLocationGalleryImageToBanner: ReturnType<
    typeof promoteLocationGalleryImageToBanner
  >;
  getLocationsBySearch: ReturnType<typeof getLocationsBySearch>;
  getLocationsByPlaceIDRandomized: ReturnType<
    typeof getLocationsByPlaceIDRandomized
  >;
  getLocationLinks: ReturnType<typeof getLocationLinks>;
  getAccountRolesForLocation: ReturnType<typeof getAccountRolesForLocation>;
  getRecommendedLocations: ReturnType<typeof getRecommendedLocations>; // Use getSuggestedLocations instead
  getRecommendedLocationsGlobal: ReturnType<
    typeof getRecommendedLocationsGlobal
  >;
  getRecommendedPlaces: ReturnType<typeof getRecommendedPlaces>;
  getRandomizedPlaces: ReturnType<typeof getRandomizedPlaces>;
  getNewestPlaces: ReturnType<typeof getNewestPlaces>;
  getLocationTagsByPlaceID: ReturnType<typeof getLocationTagsByPlaceID>;
  getLocationTagsV2: ReturnType<typeof getLocationTagsV2>;
  getSimilarLocations: ReturnType<typeof getSimilarLocations>;
  mapUserToDestination: ReturnType<typeof mapUserToDestination>;
  reportLocation: ReturnType<typeof reportLocation>;

  // address
  addressLookup: ReturnType<typeof addressLookup>;
  getCoordinatesByAddress: ReturnType<typeof getCoordinatesByAddress>;
  getCoordinatesByGoogleId: ReturnType<typeof getCoordinatesByGoogleId>;

  // auth
  loginNostr: ReturnType<typeof loginNostr>;
  login: ReturnType<typeof login>;
  initiatePasswordReset: ReturnType<typeof initiatePasswordReset>;
  resetPassword: ReturnType<typeof resetPassword>;
  resendEmailVerification: ReturnType<typeof resendEmailVerification>;
  updateAccountEmail: ReturnType<typeof updateAccountEmail>;
  verifyEmail: ReturnType<typeof verifyEmail>;
  sendOTP: ReturnType<typeof sendOTP>;
  verifyOTP: ReturnType<typeof verifyOTP>;
  authApple: ReturnType<typeof authApple>;
  authGoogle: ReturnType<typeof authGoogle>;
  sendEventSignup: ReturnType<typeof sendEventSignup>;

  /////////////////
  // authed APIs //
  /////////////////
  // acount role
  getUserAccount: ReturnType<typeof getUserAccount>;
  removeAccountRole: ReturnType<typeof removeAccountRole>;
  addAccountRole: ReturnType<typeof addAccountRole>;
  saveDeviceInfo: ReturnType<typeof saveDeviceInfo>;
  getFollowedByAccounts: ReturnType<typeof getFollowedByAccounts>;
  reportContent: ReturnType<typeof reportContent>;
  followTierZeroPlaces: ReturnType<typeof followTierZeroPlaces>;
  blockAccount: ReturnType<typeof blockAccount>;
  unblockAccount: ReturnType<typeof unblockAccount>;
  muteAccount: ReturnType<typeof muteAccount>;
  unmuteAccount: ReturnType<typeof unmuteAccount>;
  checkBlockStatus: ReturnType<typeof checkBlockStatus>;
  getBlockedAccounts: ReturnType<typeof getBlockedAccounts>;
  getMutedAccounts: ReturnType<typeof getMutedAccounts>;
  /**
   * @unstable
   */
  private updateAccountFollowingList: ReturnType<
    typeof updateAccountFollowingList
  >;
  /**
   * get a list of interests acknowledged by the backend
   */
  createInterests: ReturnType<typeof createInterests>;
  getAccountInterests: ReturnType<typeof getAccountInterests>;
  getInterests: ReturnType<typeof getInterests>;
  getInterestImages: ReturnType<typeof getInterestImages>;
  searchInterestImages: ReturnType<typeof searchInterestImages>;
  getRecommendedFollows: ReturnType<typeof getRecommendedFollows>;

  // nostr note
  /**
   * @deprecated prefer to other .post methods
   * remove after: 2024/11/01
   */
  _postNote: ReturnType<typeof postNote>;
  deleteNote: ReturnType<typeof deleteNote>;
  postReaction: ReturnType<typeof postReaction>;
  recordNotesAsSeen: ReturnType<typeof recordNotesAsSeen>;
  signEvent: ReturnType<typeof signEvent>;

  // s3
  private presign: ReturnType<typeof presign>;

  // place
  updatePlace: ReturnType<typeof updatePlace>;

  // Ambassador
  postAmbassadorInquiry: ReturnType<typeof postAmbassadorInquiry>;

  /**
   * COLLECTIONS.
   */
  // GET COLLECTION.
  getCollectionById: ReturnType<typeof getCollectionById>;

  // COLLECTION CRUD.
  createCollection: ReturnType<typeof createCollection>;
  editCollection: ReturnType<typeof editCollection>;
  markCollectionAsFeatured: ReturnType<typeof markCollectionAsFeatured>;
  unmarkCollectionAsFeatured: ReturnType<typeof unmarkCollectionAsFeatured>;
  deleteCollection: ReturnType<typeof deleteCollection>;

  // MANAGE COLLECTION LOCATIONS.
  addLocationToCollections: ReturnType<typeof addLocationToCollections>;
  removeLocationFromCollections: ReturnType<
    typeof removeLocationFromCollections
  >;
  updateLocationCollections: ReturnType<typeof updateLocationCollections>;
  updateCollectionLocation: ReturnType<typeof updateCollectionLocation>;

  // SEARCH & DISCOVERY.
  searchCollections: ReturnType<typeof searchCollections>;
  getNewestCollections: ReturnType<typeof getNewestCollections>;
  getPopularCollections: ReturnType<typeof getPopularCollections>;
  getRecommendedCollections: ReturnType<typeof getRecommendedCollections>;
  getCollectors: ReturnType<typeof getCollectors>;
  getFeaturedCollections: ReturnType<typeof getFeaturedCollections>;

  // ACCOUNT COLLECTIONS.
  getUserCollections: ReturnType<typeof getUserCollections>;
  getUserCollectionsForLocation: ReturnType<
    typeof getUserCollectionsForLocation
  >;
  getAccountCollections: ReturnType<typeof getAccountCollections>;

  // SAVE COLLECTIONS.
  saveCollection: ReturnType<typeof saveCollection>;
  unsaveCollection: ReturnType<typeof unsaveCollection>;
  getCollectionSaves: ReturnType<typeof getCollectionSaves>;

  // SHARING & COLLABORATION.
  getCollectionViewers: ReturnType<typeof getCollectionViewers>;
  addViewerToCollection: ReturnType<typeof addViewerToCollection>;
  removeViewerFromCollection: ReturnType<typeof removeViewerFromCollection>;
  inviteContributorToCollection: ReturnType<
    typeof inviteContributorToCollection
  >;
  acceptInvitationToCollection: ReturnType<typeof acceptInvitationToCollection>;
  declineInvitationToCollection: ReturnType<
    typeof declineInvitationToCollection
  >;
  removeContributorFromCollection: ReturnType<
    typeof removeContributorFromCollection
  >;
  canEditCollection: ReturnType<typeof canEditCollection>;

  // IMPORT GOOGLE MAPS COLLECTION.
  importGoogleMapsCollection: ReturnType<typeof importGoogleMapsCollection>;

  // Account Search.
  getAccountById: ReturnType<typeof getAccountById>;

  getVanityPathMapping: ReturnType<typeof getVanityPathMapping>;

  // Event Ticket Order / Refunds
  getEventUserFinancialTimeline: ReturnType<
    typeof getEventUserFinancialTimeline
  >;
  getSingleOrderHistory: ReturnType<typeof getSingleOrderHistory>;
  refundOrder: ReturnType<typeof refundOrder>;
  getRefundStatus: ReturnType<typeof getRefundStatus>;
  getRefundFeeEstimation: ReturnType<typeof getRefundFeeEstimation>;

  private constructor(
    public readonly rest_api_url: URL,
    public readonly relay_url: string,
    public readonly aws_cdn_url: URL,
    public readonly getJwt: func_GetJwt,
    public readonly getNostrSigner: func_GetNostrSigner
  ) {
    this.getTimezoneInfo = getTimezoneInfo(rest_api_url);

    this._getPlaceNames = getPlaceNames(rest_api_url);
    this._getAllPlaceRegionCountryNames =
      getAllPlaceRegionCountryNames(rest_api_url);
    this._getPlaceByOsmRef = getPlaceByOsmRef(rest_api_url);
    this._getPlaceById = getPlaceById(rest_api_url);
    this._getPlaces = getPlaces(rest_api_url);
    this.getAccountPlaceRoles = getAccountPlaceRoles(rest_api_url);
    this.getPlaceNotes = getPlaceNotes(rest_api_url);
    this.getPlaceMetrics = getPlaceMetrics(rest_api_url);
    this.getPlaceChats = getPlaceChats(rest_api_url);
    this.getPlaceCategoryScores = getPlaceCategoryScores(rest_api_url);
    this.getPlaceEvent = getPlaceEvent(rest_api_url);
    this.getPlaceGalleryImages = getPlaceGalleryImages(rest_api_url);
    this.postPlaceGalleryImage = postPlaceGalleryImage(rest_api_url, getJwt);
    this.deletePlaceGalleryImage = deletePlaceGalleryImage(
      rest_api_url,
      getJwt
    );

    this.getRegion = getRegion(rest_api_url);
    this.getBrands = getBrands(rest_api_url);
    this.getExchangeRate = getExchangeRate(rest_api_url);
    // Event details
    this.getEvents = getEvents(rest_api_url, getJwt);
    this.getEventCalendars = getEventCalendars(rest_api_url);
    this.getEventRsvps = getEventRsvps(rest_api_url, getJwt);
    this.getEventAttendees = getEventAttendees(rest_api_url, getJwt);
    this.updateRsvpStatus = updateRsvpStatus(rest_api_url, getJwt);
    this.getRandomizedEvents = getRandomizedEvents(rest_api_url, getJwt);
    this.getPopularEvents = getPopularEvents(rest_api_url, getJwt);
    this.getNewestEvents = getNewestEvents(rest_api_url, getJwt);
    this.getFeaturedEvents = getFeaturedEvents(rest_api_url, getJwt);
    this.getRecommendedEvents = getRecommendedEvents(rest_api_url, getJwt);
    this.getEventDetails = getEventDetails(rest_api_url, getJwt);

    // Check username availability in satlantis

    this.checkUsernameAvailabilityInSatlantis =
      checkUsernameAvailabilityInSatlantis(rest_api_url);

    // Calendar Events
    this.getEventById = getEventById(rest_api_url);
    this.getPlaceCalendarEvents = getPlaceCalendarEvents(rest_api_url, getJwt);
    this.deletePlaceCalendarEvent = deletePlaceCalendarEvent(
      rest_api_url,
      getJwt
    );
    this.deletePlaceCalendarEventById = deletePlaceCalendarEventById(
      rest_api_url,
      getJwt
    );

    this.postPlaceCalendarEvent = postPlaceCalendarEvent(rest_api_url, getJwt);
    this.postCalendarEventRSVP = postCalendarEventRSVP(
      rest_api_url,
      getJwt,
      getNostrSigner
    );
    this.postCalendarEventAnnouncement = postCalendarEventAnnouncement(
      rest_api_url,
      getJwt
    );
    this.postCalendarEventAnnouncementV2 = postCalendarEventAnnouncementV2(
      rest_api_url,
      getJwt
    );
    this.postCalendarEventNote = postCalendarEventNote(rest_api_url, getJwt);
    this.putUpdateCalendarEvent = putUpdateCalendarEvent(rest_api_url, getJwt);
    this.relistCalendarEvent = relistCalendarEvent(rest_api_url, getJwt);
    this.unlistCalendarEvent = unlistCalendarEvent(rest_api_url, getJwt);
    this.respondCalendarEventCohostInvitation =
      respondCalendarEventCohostInvitation(rest_api_url, getJwt);
    this.getAccountCalendarEvents = getAccountCalendarEvents(rest_api_url);
    this.getCalendarEventTypes = getCalendarEventTypes(rest_api_url);
    this.downloadCalendarEventAttendees = downloadCalendarEventAttendees(
      rest_api_url,
      getJwt
    );
    this.downloadCalendarEventIcsFile = downloadCalendarEventIcsFile(
      rest_api_url,
      getJwt
    );
    this.saveRegistrationQuestions = saveRegistrationQuestions(
      rest_api_url,
      getJwt
    );
    this.unmarkCalendarEventAsFeatured = unmarkCalendarEventAsFeatured(
      rest_api_url,
      getJwt
    );
    this.markCalendarEventAsFeatured = markCalendarEventAsFeatured(
      rest_api_url,
      getJwt
    );
    this.inviteAttendees = inviteAttendees(rest_api_url, getJwt);
    this.createEventTicketType = createEventTicketType(rest_api_url, getJwt);
    this.updateEventTicketType = updateEventTicketType(rest_api_url, getJwt);
    this.updateEventTicketStatus = updateEventTicketStatus(
      rest_api_url,
      getJwt
    );
    this.deleteEventTicketType = deleteEventTicketType(rest_api_url, getJwt);
    this.getEventTicketTypes = getEventTicketTypes(rest_api_url);
    this.purchaseEventTicket = purchaseEventTicket(
      rest_api_url,
      getJwt,
      getNostrSigner
    );
    this.getEventTicketPaymentStatus =
      getEventTicketPaymentStatus(rest_api_url);
    this.assignTicketToRSVP = assignTicketToRSVP(rest_api_url, getJwt);
    this.removeTicketFromUser = removeTicketFromUser(rest_api_url, getJwt);
    this.getEventFinancialsSummary = getEventFinancialsSummary(
      rest_api_url,
      getJwt
    );
    this.getEventTicketWithdrawalFee = getEventTicketWithdrawalFee(
      rest_api_url,
      getJwt
    );
    this.getEventFinancialsWithdrawalStatus =
      getEventFinancialsWithdrawalStatus(rest_api_url, getJwt);
    this.postEventFinancialsWithdraw = postEventFinancialsWithdraw(
      rest_api_url,
      getJwt
    );
    this.getEventFinancialsWithdrawalFeeEstimations =
      getEventFinancialsWithdrawalFeeEstimations(rest_api_url, getJwt);
    this.subscribeToCalendar = subscribeToCalendar(rest_api_url, getJwt);
    this.unsubscribeFromCalendar = unsubscribeFromCalendar(
      rest_api_url,
      getJwt
    );
    this.isSubscribedToCalendar = isSubscribedToCalendar(rest_api_url, getJwt);
    this.getUserCalendarSubscriptions = getUserCalendarSubscriptions(
      rest_api_url,
      getJwt
    );
    this.getCalendarSubscribers = getCalendarSubscribers(rest_api_url, getJwt);
    this.getEventsContacts = getEventsContacts(rest_api_url, getJwt);
    this.getCalendarEventTags = getCalendarEventTags(rest_api_url);
    this.getRecommendedCalendarEventTags =
      getRecommendedCalendarEventTags(rest_api_url);
    this.createCalendarEventTag = createCalendarEventTag(rest_api_url, getJwt);

    // Calendars
    this.getCalendarByID = getCalendarByID(rest_api_url);
    this.createCalendar = createCalendar(rest_api_url, getJwt);
    this.editCalendar = editCalendar(rest_api_url, getJwt);
    this.deleteCalendar = deleteCalendar(rest_api_url, getJwt);
    this.addEventToCalendar = addEventToCalendar(rest_api_url, getJwt);
    this.removeEventFromCalendar = removeEventFromCalendar(
      rest_api_url,
      getJwt
    );
    this.setOfficialCalendarToEvent = setOfficialCalendarToEvent(
      rest_api_url,
      getJwt
    );
    this.unsetOfficialCalendarFromEvent = unsetOfficialCalendarFromEvent(
      rest_api_url,
      getJwt
    );
    this.submitEventToCalendar = submitEventToCalendar(rest_api_url, getJwt);
    this.approveEventSubmission = approveEventSubmission(rest_api_url, getJwt);
    this.declineEventSubmission = declineEventSubmission(rest_api_url, getJwt);
    this.getEventSubmissions = getEventSubmissions(rest_api_url, getJwt);
    this.importEventFromUrl = importEventFromUrl(rest_api_url, getJwt);
    this.markCalendarAsFeatured = markCalendarAsFeatured(rest_api_url, getJwt);
    this.unmarkCalendarAsFeatured = unmarkCalendarAsFeatured(
      rest_api_url,
      getJwt
    );
    this.getFeaturedCalendars = getFeaturedCalendars(rest_api_url);
    this.getNewestCalendars = getNewestCalendars(rest_api_url);
    this.getPopularCalendars = getPopularCalendars(rest_api_url);
    this.getRecommendedCalendars = getRecommendedCalendars(
      rest_api_url,
      getJwt
    );
    this.searchCalendars = searchCalendars(rest_api_url);
    this.getCalendarsRandomized = getCalendarsRandomized(rest_api_url);
    this.getEventsFromCalendar = getEventsFromCalendar(rest_api_url);

    // Account
    this._getAccount = getAccount(rest_api_url, getJwt);
    this._getAccountFollowings = getAccountFollowings(rest_api_url);
    this._getAccountFollowers = getAccountFollowers(rest_api_url);
    this.getAccountsBySearch = getAccountsBySearch(rest_api_url, getJwt);
    this.searchAccountViaEmail = searchAccountViaEmail(rest_api_url, getJwt);
    this.sendCohostEmailInviteToCalendarEvent =
      sendCohostEmailInviteToCalendarEvent(rest_api_url, getJwt);
    this.getCalendarsByAccount = getCalendarsByAccount(rest_api_url);
    this.getEventsByAccount = getEventsByAccount(rest_api_url, getJwt);
    this.getAllUserEvents = getAllUserEvents(rest_api_url, getJwt);
    this.createAccount = createAccount(rest_api_url);
    this.updateAccount = updateAccount(rest_api_url, getJwt);
    this.deleteAccount = deleteAccount(rest_api_url, getJwt, getNostrSigner);
    this._blackListAccount = blacklistAccount(rest_api_url, getJwt);
    this.blacklistAccountWithNpub = blacklistAccount(rest_api_url, getJwt);
    this.getUserFollowers = getUserFollowers(rest_api_url, getJwt);

    this.getNotesOfPubkey = getNotesOfPubkey(rest_api_url);
    this.getNoteReactionsById = getNoteReactionsById(rest_api_url);
    this.getNoteCommentsById = getNoteCommentsById(rest_api_url);
    this.getNotes = getNotes(rest_api_url, getJwt);
    this.buildGlobalFeed = buildGlobalFeed(rest_api_url, getJwt);
    this.getNote = getNote(rest_api_url);
    this.getNoteByNostrId = getNoteByNostrId(rest_api_url);
    this.getIpInfo = getIpInfo(rest_api_url);
    this.getAccountActivities = getAccountActivities(rest_api_url);
    this.getUserActivities = getUserActivities(rest_api_url, getJwt);
    this.updateAdditionalPictures = updateAdditionalPictures(
      rest_api_url,
      getJwt
    );
    this.getSystemBanners = getSystemBanners(rest_api_url);

    // Notifications
    this.getNotifications = getNotifications(rest_api_url, getJwt);

    // Wallet
    this.getWallet = getWallet(rest_api_url, getJwt);
    this.createReceiveInvoice = createReceiveInvoice(rest_api_url, getJwt);
    this.sendPayment = sendPayment(rest_api_url, getJwt);
    this.estimatePaymentFee = estimatePaymentFee(rest_api_url, getJwt);
    this.getTransactionHistory = getTransactionHistory(rest_api_url, getJwt);
    this.getTransactionDetails = getTransactionDetails(rest_api_url, getJwt);
    this.decodeInvoice = decodeInvoice(rest_api_url, getJwt);
    this.getWalletExchangeRate = getWalletExchangeRate(rest_api_url, getJwt);

    // Location
    this.getLocationsWithinBoundingBox = getLocationsWithinBoundingBox(
      rest_api_url,
      getJwt
    );
    this.getLocationReviews = getLocationReviews(rest_api_url);
    this.suggestLocation = suggestLocation(rest_api_url, getJwt);
    this.getLocationByID = getLocation(rest_api_url);
    this.getLocationByGoogleId = getLocationByGoogleId(rest_api_url);
    this.getLocationsByPlaceID = getLocationsByPlaceID(rest_api_url, getJwt);
    this.getNearbyLocations = getNearbyLocations(rest_api_url, getJwt);
    this._claimLocation = claimLocation(rest_api_url, getJwt);
    this.proveLocationClaim = proveLocationClaim(
      rest_api_url,
      getJwt,
      getNostrSigner
    );
    this.updateLocation = updateLocation(rest_api_url, getJwt);
    this.getAccountsForLocation = getAccountsForLocation(rest_api_url);
    this.getLocationGalleryImages = getLocationGalleryImages(rest_api_url);
    this._postLocationGalleryImage = postLocationGalleryImage(
      rest_api_url,
      getJwt
    );
    this.updateLocationGalleryImage = updateLocationGalleryImage(
      rest_api_url,
      getJwt
    );
    this.getGlobalLocations = getGlobalLocations(rest_api_url, getJwt);
    this.deleteLocationGalleryImage = deleteLocationGalleryImage(
      rest_api_url,
      getJwt
    );
    this.promoteLocationGalleryImageToBanner =
      promoteLocationGalleryImageToBanner(rest_api_url, getJwt);
    this.getLocationsBySearch = getLocationsBySearch(rest_api_url);
    this.getLocationsByPlaceIDRandomized =
      getLocationsByPlaceIDRandomized(rest_api_url);
    this.getLocationLinks = getLocationLinks(rest_api_url);
    this.getAccountRolesForLocation = getAccountRolesForLocation(rest_api_url);
    this.getRecommendedLocations = getRecommendedLocations(
      rest_api_url,
      getJwt
    );
    this.getRecommendedLocationsGlobal = getRecommendedLocationsGlobal(
      rest_api_url,
      getJwt
    );
    this.getRecommendedPlaces = getRecommendedPlaces(rest_api_url, getJwt);
    this.getRandomizedPlaces = getRandomizedPlaces(rest_api_url);
    this.getNewestPlaces = getNewestPlaces(rest_api_url);
    this.getLocationTagsByPlaceID = getLocationTagsByPlaceID(rest_api_url);
    this.getLocationTagsV2 = getLocationTagsV2(rest_api_url);
    this.getSimilarLocations = getSimilarLocations(rest_api_url);
    this.mapUserToDestination = mapUserToDestination(rest_api_url);
    this.reportLocation = reportLocation(rest_api_url, this.getJwt);

    // Address
    this.addressLookup = addressLookup(rest_api_url);
    this.getCoordinatesByAddress = getCoordinatesByAddress(rest_api_url);
    this.getCoordinatesByGoogleId = getCoordinatesByGoogleId(rest_api_url);

    // Authed APIs
    this.getUserAccount = getUserAccount(rest_api_url, this.getJwt);
    this.removeAccountRole = removeAccountRole(
      rest_api_url,
      this.getJwt,
      this.getNostrSigner
    );
    this.addAccountRole = addAccountRole(
      rest_api_url,
      this.getJwt,
      this.getNostrSigner
    );
    this.saveDeviceInfo = saveDeviceInfo(rest_api_url, this.getJwt);
    this.getFollowedByAccounts = getFollowedByAccounts(
      rest_api_url,
      this.getJwt
    );
    this.reportContent = reportContent(rest_api_url, this.getJwt);
    this.followTierZeroPlaces = followTierZeroPlaces(rest_api_url, this.getJwt);
    this.blockAccount = blockAccount(rest_api_url, this.getJwt);
    this.unblockAccount = unblockAccount(rest_api_url, this.getJwt);
    this.muteAccount = muteAccount(rest_api_url, this.getJwt);
    this.unmuteAccount = unmuteAccount(rest_api_url, this.getJwt);
    this.checkBlockStatus = checkBlockStatus(rest_api_url, this.getJwt);
    this.getBlockedAccounts = getBlockedAccounts(rest_api_url, this.getJwt);
    this.getMutedAccounts = getMutedAccounts(rest_api_url, this.getJwt);
    this.updateAccountFollowingList = updateAccountFollowingList(
      rest_api_url,
      this.getJwt,
      this.getNostrSigner
    );
    this.presign = presign(rest_api_url, getJwt, getNostrSigner);
    this.postReaction = postReaction(rest_api_url, this.getJwt);
    this.recordNotesAsSeen = recordNotesAsSeen(rest_api_url, this.getJwt);
    this._postNote = postNote(rest_api_url, this.getJwt);
    this.deleteNote = deleteNote(rest_api_url, this.getJwt);
    this.signEvent = signEvent(rest_api_url, getJwt);
    this.updatePlace = updatePlace(rest_api_url, this.getJwt);

    // sign-in / sign-up
    this.login = login(rest_api_url);
    this.loginNostr = loginNostr(rest_api_url);
    this.initiatePasswordReset = initiatePasswordReset(this.rest_api_url);
    this.resetPassword = resetPassword(this.rest_api_url);
    this.resendEmailVerification = resendEmailVerification(
      this.rest_api_url,
      getJwt
    );
    this.updateAccountEmail = updateAccountEmail(this.rest_api_url, getJwt);
    this.verifyEmail = verifyEmail(this.rest_api_url);
    this.createInterests = createInterests(this.rest_api_url, this.getJwt);
    this.getAccountInterests = getAccountInterests(this.rest_api_url);
    this.getRecommendedFollows = getRecommendedFollows(
      this.rest_api_url,
      this.getJwt
    );
    this.getInterests = getInterests(this.rest_api_url);
    this.getInterestImages = getInterestImages(this.rest_api_url);
    this.searchInterestImages = searchInterestImages(this.rest_api_url);
    this.sendOTP = sendOTP(this.rest_api_url);
    this.verifyOTP = verifyOTP(this.rest_api_url);
    this.authApple = authApple(this.rest_api_url);
    this.authGoogle = authGoogle(this.rest_api_url);
    this.sendEventSignup = sendEventSignup(this.rest_api_url);

    //
    this.postAmbassadorInquiry = postAmbassadorInquiry(
      rest_api_url,
      getJwt,
      getNostrSigner
    );

    /**
     * COLLECTIONS.
     */
    // GET COLLECTION.
    this.getCollectionById = getCollectionById(rest_api_url, getJwt);

    // COLLECTION CRUD.
    this.createCollection = createCollection(rest_api_url, getJwt);
    this.editCollection = editCollection(rest_api_url, getJwt);
    this.markCollectionAsFeatured = markCollectionAsFeatured(
      rest_api_url,
      getJwt
    );
    this.unmarkCollectionAsFeatured = unmarkCollectionAsFeatured(
      rest_api_url,
      getJwt
    );
    this.deleteCollection = deleteCollection(rest_api_url, getJwt);

    // MANAGE COLLECTION LOCATIONS.
    this.addLocationToCollections = addLocationToCollections(
      rest_api_url,
      getJwt
    );
    this.removeLocationFromCollections = removeLocationFromCollections(
      rest_api_url,
      getJwt
    );
    this.updateLocationCollections = updateLocationCollections(
      rest_api_url,
      getJwt
    );
    this.updateCollectionLocation = updateCollectionLocation(
      rest_api_url,
      getJwt
    );

    // SEARCH & DISCOVERY.
    this.searchCollections = searchCollections(rest_api_url);
    this.getNewestCollections = getNewestCollections(rest_api_url);
    this.getPopularCollections = getPopularCollections(rest_api_url);
    this.getRecommendedCollections = getRecommendedCollections(
      rest_api_url,
      getJwt
    );
    this.getCollectors = getCollectors(rest_api_url);
    this.getFeaturedCollections = getFeaturedCollections(rest_api_url);

    // ACCOUNT COLLECTIONS.
    this.getUserCollections = getUserCollections(rest_api_url, getJwt);
    this.getUserCollectionsForLocation = getUserCollectionsForLocation(
      rest_api_url,
      getJwt
    );
    this.getAccountCollections = getAccountCollections(rest_api_url);

    // SAVE COLLECTIONS.
    this.saveCollection = saveCollection(rest_api_url, getJwt);
    this.unsaveCollection = unsaveCollection(rest_api_url, getJwt);
    this.getCollectionSaves = getCollectionSaves(rest_api_url, getJwt);

    // SHARING & COLLABORATION.
    this.getCollectionViewers = getCollectionViewers(rest_api_url, getJwt);
    this.addViewerToCollection = addViewerToCollection(rest_api_url, getJwt);
    this.removeViewerFromCollection = removeViewerFromCollection(
      rest_api_url,
      getJwt
    );
    this.inviteContributorToCollection = inviteContributorToCollection(
      rest_api_url,
      getJwt
    );
    this.acceptInvitationToCollection = acceptInvitationToCollection(
      rest_api_url,
      getJwt
    );
    this.declineInvitationToCollection = declineInvitationToCollection(
      rest_api_url,
      getJwt
    );
    this.removeContributorFromCollection = removeContributorFromCollection(
      rest_api_url,
      getJwt
    );
    this.canEditCollection = canEditCollection(rest_api_url, getJwt);

    // IMPORT GOOGLE MAPS COLLECTION.
    this.importGoogleMapsCollection = importGoogleMapsCollection(
      rest_api_url,
      getJwt
    );

    // ACCOUNT SEARCH.
    // Account Search.
    this.getAccountById = getAccountById(rest_api_url);

    this.getVanityPathMapping = getVanityPathMapping(rest_api_url);

    // Event Ticket Order / Refunds
    this.getEventUserFinancialTimeline = getEventUserFinancialTimeline(
      rest_api_url,
      getJwt
    );
    this.getSingleOrderHistory = getSingleOrderHistory(rest_api_url, getJwt);
    this.refundOrder = refundOrder(rest_api_url, getJwt);
    this.getRefundStatus = getRefundStatus(rest_api_url, getJwt);
    this.getRefundFeeEstimation = getRefundFeeEstimation(rest_api_url, getJwt);
  }

  static New(args: {
    baseURL: string | URL;
    relay_url: string;
    aws_cdn_url: string | URL;
    getJwt?: () => string;
    getNostrSigner?: func_GetNostrSigner;
  }) {
    const validURL = newURL(args.baseURL);
    if (validURL instanceof Error) {
      return validURL;
    }
    const aws_url = newURL(args.aws_cdn_url);
    if (aws_url instanceof Error) {
      return aws_url;
    }
    if (args.getJwt == undefined) {
      args.getJwt = () => "";
    }
    if (args.getNostrSigner == undefined) {
      args.getNostrSigner = async () =>
        new Error("nostr signer is not provided");
    }
    return new Client(
      validURL,
      args.relay_url,
      aws_url,
      args.getJwt,
      args.getNostrSigner
    );
  }

  // Place
  getPlaceNames = async () => {
    return await this._getPlaceNames();
  };

  getAllPlaceRegionCountryNames = async () => {
    return await this._getAllPlaceRegionCountryNames();
  };

  getPlaces = async (
    args: {
      filters: {
        name: string;
      };
      limit: number;
      page: number;
      sortColumn: "score" | "id" | "price" | "trending" | "topPicks";
      sortDirection: "desc" | "asc";
    },
    options?: { useCache: boolean }
  ) => {
    if (options?.useCache) {
      const results = [];
      for (const place of this.places.values()) {
        if (place.name.includes(args.filters.name)) {
          results.push(place);
        }
      }
      return results;
    }
    const places = await this._getPlaces(args);
    if (places instanceof Error) {
      return places;
    }
    // set cache
    for (const place of places) {
      this.places.set(place.id, place);
    }
    return places;
  };

  getPlacesMinimal = async (args: {
    filters: {
      name: string;
    };
    limit: number;
    page: number;
    sortColumn: "score" | "id" | "price";
    sortDirection: "desc" | "asc";
  }) => {
    const places = await getPlacesMinimal(this.rest_api_url)(args);
    if (places instanceof Error) {
      return places;
    }
    return places;
  };

  getPlaceByOsmRef = async (
    args: { osmRef: string | number },
    options?: { useCache: boolean }
  ) => {
    if (options?.useCache) {
      const place = this.places.get(args.osmRef);
      if (place) {
        return place;
      }
    }
    const place = await this._getPlaceByOsmRef(args);
    if (place instanceof Error) {
      return place;
    }
    this.places.set(place.id, place);
    return place;
  };

  getPlaceById = async (
    args: { id: number },
    options?: { useCache: boolean }
  ) => {
    if (options?.useCache) {
      const place = this.places.get(args.id);
      if (place) {
        return place;
      }
    }
    const place = await this._getPlaceById(args);
    if (place instanceof Error) {
      return place;
    }
    this.places.set(place.id, place);
    return place;
  };

  // Location
  /**
   * @deprecated prefer to .resolver.getLocationByID
   * remove after: 2024/10/10
   */
  getLocation = async (id: number) => {
    return this.resolver.getLocationByID(id);
  };

  /**
   * @deprecated prefer to .getLocationCategories
   * | remove after: 2024/10/10
   */
  getLocationTags = () => {
    return getLocationTags(this.rest_api_url)();
  };

  getLocationCategories = async () => {
    const tags = await this.getLocationTags();
    if (tags instanceof Error) {
      return tags;
    }
    const categories = convertToLocationCategories(tags);
    return categories;
  };

  // Calendar Event
  createCalendarEvent = async (args: {
    description: string;
    placeATag: string | undefined;
    calendarEventType: string;
    url: string;
    title: string;
    imageURL: string;
    // todo: use RFC3339 / ISO8601 format
    startDate: Date;
    endDate: Date;
    timezone: string;
    geoHash: string;
    location: string;
    cohosts: string;
    venue: string;
    calendarEventTags: string;
    placeId: number | undefined;
    summary: string;
    website: string;
    googleMapsUri: string;
    venueName: string;
    googlePlaceId: string;
    autofollowHostAndCohosts?: boolean;
    allowCohostsToDownloadAttendeeList?: boolean;
    enableWaitlist?: boolean;
    capacity?: number;
    isLimitedEvent?: boolean;
    gatedEvent?: boolean;
    isUnlisted?: boolean;
  }) => {
    const jwtToken = this.getJwt();
    if (jwtToken == "") {
      return new Error("jwt token is empty");
    }

    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }
    let tags: Tag[] = [
      ["d", generateUUID()],
      ["t", args.calendarEventType],
      ["r", args.url],
      ["title", args.title],
      ["image", args.imageURL],
      ["start", Math.floor(args.startDate.getTime() / 1000).toString()],
      ["end", Math.floor(args.endDate.getTime() / 1000).toString()],
      ["start_tzid", args.timezone],
      ["g", args.geoHash],
      ["summary", args.summary],
      ["url", args.url],
      ["cohosts", args.cohosts],
      ["calendar_event_tags", args.calendarEventTags ?? ""],
      [
        "autoFollowHosts",
        args.autofollowHostAndCohosts
          ? args.autofollowHostAndCohosts.toString()
          : "false",
      ],

      [
        "rsvp_gated_enabled",
        args.gatedEvent ? args.gatedEvent.toString() : "false",
      ],

      [
        "allowCohostsToDownloadAttendeeList",
        args.allowCohostsToDownloadAttendeeList
          ? args.allowCohostsToDownloadAttendeeList.toString()
          : "false",
      ],

      ["website", args.website],
    ];

    if (args.placeATag) {
      tags.push(["placeATag", args.placeATag]);
    }

    if (args.venue) {
      tags.push(["venue", args.venue]);
    }
    if (args.location) {
      tags.push(["location", args.location]);
    }

    if (args.googleMapsUri) {
      tags.push(["googleMapsUri", args.googleMapsUri]);
    }

    if (args.venueName) {
      tags.push(["venue_name", args.venueName]);
    }

    if (args.googlePlaceId) {
      tags.push(["google_place_id", args.googlePlaceId]);
    }

    if (args.isLimitedEvent && args.capacity) {
      tags.push(["rsvp_limit", args.capacity.toString()]);
    }

    if (args.enableWaitlist && args.isLimitedEvent && args.capacity) {
      tags.push(["rsvp_waitlist_enabled", "true"]);
    } else {
      tags.push(["rsvp_waitlist_enabled", "false"]);
    }

    const event = await prepareNostrEvent(signer, {
      kind: NostrKind.Calendar_Time,
      content: args.description,
      tags,
    });

    if (event instanceof Error) {
      return event;
    }

    const res = await this.postPlaceCalendarEvent({
      ...(args.placeId && { placeId: args.placeId }), // Only include if placeId exists
      ...(args.isUnlisted !== undefined && { isUnlisted: args.isUnlisted }),
      event,
    });
    if (res instanceof Error) {
      return res;
    }
    return { postResult: res, event };
  };

  updateCalendarEvent = async (args: {
    calendarEventId: number;
    description: string;
    dTag: string;
    placeATag: string | undefined;
    calendarEventType: string;
    url: string;
    title: string;
    imageURL: string;
    // todo: use RFC3339 / ISO8601 format
    startDate: Date;
    endDate: Date;
    timezone: string;
    geoHash: string;
    location: string;
    placeId: number | undefined;
    summary: string;
    website: string;
    // todo: use RFC3339 / ISO8601 format
    cohosts: string;
    venue: string;
    calendarEventTags: string;
    googleMapsUri: string;
    venueName: string;
    googlePlaceId: string;
    autofollowHostAndCohosts?: boolean;
    allowCohostsToDownloadAttendeeList?: boolean;
    enableWaitlist?: boolean;
    capacity?: number;
    isLimitedEvent?: boolean;
    gatedEvent?: boolean;
  }) => {
    const jwtToken = this.getJwt();
    if (jwtToken == "") {
      return new Error("jwt token is empty");
    }

    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    let tags: Tag[] = [
      ["d", generateUUID()],
      ["t", args.calendarEventType],
      ["r", args.url],
      ["title", args.title],
      ["image", args.imageURL],
      ["start", Math.floor(args.startDate.getTime() / 1000).toString()],
      ["end", Math.floor(args.endDate.getTime() / 1000).toString()],
      ["start_tzid", args.timezone],
      ["g", args.geoHash],
      ["summary", args.summary],
      ["url", args.url],
      ["cohosts", args.cohosts],
      ["calendar_event_tags", args.calendarEventTags ?? ""],
      ["website", args.website],
      [
        "autoFollowHosts",
        args.autofollowHostAndCohosts
          ? args.autofollowHostAndCohosts.toString()
          : "false",
      ],
      [
        "rsvp_gated_enabled",
        args.gatedEvent ? args.gatedEvent.toString() : "false",
      ],

      [
        "allowCohostsToDownloadAttendeeList",
        args.allowCohostsToDownloadAttendeeList
          ? args.allowCohostsToDownloadAttendeeList.toString()
          : "false",
      ],
    ];

    if (args.placeATag) {
      tags.push(["placeATag", args.placeATag]);
    }

    if (args.venue) {
      tags.push(["venue", args.venue]);
    }
    if (args.location) {
      tags.push(["location", args.location]);
    }

    if (args.googleMapsUri) {
      tags.push(["googleMapsUri", args.googleMapsUri]);
    }

    if (args.venueName) {
      tags.push(["venue_name", args.venueName]);
    }

    if (args.googlePlaceId) {
      tags.push(["google_place_id", args.googlePlaceId]);
    }

    if (args.isLimitedEvent && args.capacity) {
      tags.push(["rsvp_limit", args.capacity.toString()]);
    }

    if (args.enableWaitlist && args.isLimitedEvent && args.capacity) {
      tags.push(["rsvp_waitlist_enabled", "true"]);
    } else {
      tags.push(["rsvp_waitlist_enabled", "false"]);
    }

    const event = await prepareNostrEvent(signer, {
      kind: NostrKind.Calendar_Time,
      content: args.description,
      tags,
    });

    if (event instanceof Error) {
      return event;
    }

    const res = await this.putUpdateCalendarEvent({
      calendarEventId: args.calendarEventId,
      ...(args.placeId && { placeId: args.placeId }), // Only include if placeId exists
      event,
    });
    if (res instanceof Error) {
      return res;
    }
    return { postResult: res, event };
  };

  updateCalendarEventListing = async (args: {
    eventId: number;
    isUnlisted: boolean;
  }) => {
    const jwtToken = this.getJwt();
    if (jwtToken == "") {
      return new Error("jwt token is empty");
    }

    if (args.isUnlisted) {
      const res = await this.unlistCalendarEvent({
        eventId: args.eventId,
      });
      return res;
    } else {
      const res = await this.relistCalendarEvent({
        eventId: args.eventId,
      });
      return res;
    }
  };

  createCalendarEventAnnouncement = async (args: {
    calendarEventId: number;
    calendarEventATag: string;
    content: string;
  }) => {
    const jwtToken = this.getJwt();
    if (jwtToken == "") {
      return new Error("jwt token is empty");
    }

    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    const event = await prepareNostrEvent(signer, {
      kind: NostrKind.TEXT_NOTE,
      content: args.content,
      tags: [["a", args.calendarEventATag]],
    });
    if (event instanceof Error) {
      return event;
    }

    const res = await this.postCalendarEventAnnouncement({
      calendarEventId: args.calendarEventId,
      event,
    });
    if (res instanceof Error) {
      return res;
    }
    return { postResult: res, event };
  };

  createCalendarEventNote = async (args: {
    calendarEventId: number;
    calendarEventATag: string;
    content: string;
  }) => {
    const jwtToken = this.getJwt();
    if (jwtToken == "") {
      return new Error("jwt token is empty");
    }

    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    const event = await prepareNostrEvent(signer, {
      kind: NostrKind.TEXT_NOTE,
      content: args.content,
      tags: [["a", args.calendarEventATag]],
    });
    if (event instanceof Error) {
      return event;
    }

    const res = await this.postCalendarEventNote({
      calendarEventId: args.calendarEventId,
      event,
    });
    if (res instanceof Error) {
      return res;
    }
    return { postResult: res, event };
  };

  createCalendarEventAnnouncementV2 = async (args: {
    event: {
      id: number;
      atag: string;
    };
    subject: string;
    body: string;
    toDiscussion: boolean;
    recipients: { id: number }[];
  }) => {
    const jwtToken = this.getJwt();
    if (jwtToken == "") {
      return new Error("jwt token is empty");
    }

    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }
    const event = await prepareNostrEvent(signer, {
      kind: NostrKind.TEXT_NOTE,
      content: args.body,
      tags: [["a", args.event.atag]],
    });
    if (event instanceof Error) {
      return event;
    }
    const res = await this.postCalendarEventAnnouncementV2({
      calendarEventId: args.event.id,
      event,
      toDiscussion: args.toDiscussion,
      toEmail: true,
      toNostr: false,
      emailSubject: args.subject,
      emailRecipientIds: args.recipients.map((r) => r.id),
    });
    if (res instanceof Error) {
      return res;
    }
    return { postResult: res, event };
  };

  deleteCalendarEvent = async (args: {
    eventId: string;
    placeCalendarEventId: number;
  }) => {
    const jwtToken = this.getJwt();
    if (jwtToken == "") {
      return new Error("jwt token is empty");
    }

    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    const event = await prepareNostrEvent(signer, {
      kind: NostrKind.DELETE,
      tags: [["e", args.eventId]],
      content: "",
    });
    if (event instanceof Error) {
      return event;
    }

    const res = await this.deletePlaceCalendarEvent({
      placeCalendarEventId: args.placeCalendarEventId,
      event,
    });
    if (res instanceof Error) {
      return res;
    }
    return { postResult: res, event };
  };

  deleteCalendarEventById = async (args: {
    eventId: string;
    placeCalendarEventId: number;
  }) => {
    const jwtToken = this.getJwt();
    if (jwtToken == "") {
      return new Error("jwt token is empty");
    }

    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    const event = await prepareNostrEvent(signer, {
      kind: NostrKind.DELETE,
      tags: [["e", args.eventId]],
      content: "",
    });
    if (event instanceof Error) {
      return event;
    }

    const res = await this.deletePlaceCalendarEventById({
      placeCalendarEventId: args.placeCalendarEventId,
      event,
    });
    if (res instanceof Error) {
      return res;
    }
    return { postResult: res, event };
  };

  // TODO: Depricated method
  async getInterestsOf(pubkey: PublicKey) {
    const relay = SingleRelayConnection.New(this.relay_url);
    if (relay instanceof Error) {
      return relay;
    }
    const res = await getInterestsOf(relay, pubkey);
    await relay.close();
    return res;
  }

  // TODO: Depricated method
  async publishInterest(interests: Iterable<string>) {
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }
    const interest_tags: Tag[] = [];
    for (const interest of interests) {
      interest_tags.push(["t", interest]);
    }
    const event = await prepareNostrEvent(signer, {
      kind: 10015 as NostrKind, // TODO: add to blowater: NostrKind.Interests
      content: "",
      tags: interest_tags,
    });
    if (event instanceof Error) {
      return event;
    }
    const relay = SingleRelayConnection.New(this.relay_url, { log: false });
    if (relay instanceof Error) {
      return relay;
    }
    const res = await relay.sendEvent(event);
    await relay.close();
    if (res instanceof Error) {
      return res;
    }
    return event;
  }

  async updateInterests(interests: Interest[]) {
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }
    return createInterests(this.rest_api_url, this.getJwt)(interests);
  }

  /**
   * Checks the availability of a NIP05 address on a given domain.
   */
  checkUsernameAvailability = async (userName: string) => {
    let domain;
    if (this.rest_api_url.host == "api-dev.satlantis.io") {
      domain = "https://dev.satlantis.io";
    } else {
      domain = "https://www.satlantis.io";
    }
    const response = await getPubkeyByNip05({ domain, name: userName });
    if (response instanceof Error) {
      return response;
    }
    if (response == undefined) {
      return true;
    }
    return false;
  };

  /**
   * get following list of the current pubkey
   * @unstable
   */
  getMyFollowingPubkeys = async () => {
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }
    const relay = SingleRelayConnection.New(this.relay_url);
    if (relay instanceof Error) {
      return relay;
    }
    const following = await getFollowingPubkeys(signer.publicKey, relay);
    await relay.close();
    return following;
  };

  /**
   * get following list of the given pubkey
   * @unstable
   */
  getAccountFollowingPubkeys = async (pubkey: string | PublicKey) => {
    const relay = SingleRelayConnection.New(this.relay_url);
    if (relay instanceof Error) {
      return relay;
    }

    try {
      const publicKey =
        pubkey instanceof PublicKey ? pubkey : PublicKey.FromString(pubkey);

      if (publicKey instanceof Error) {
        return publicKey;
      }

      return await getFollowingPubkeys(publicKey, relay);
    } finally {
      await relay.close();
    }
  };

  /**
   * get note by nostrId
   * @unstable
   */
  getOriginalNoteByNostrId = async (noteId: string) => {
    const relay = SingleRelayConnection.New(this.relay_url);
    if (relay instanceof Error) {
      return relay;
    }

    try {
      return await relay.getEvent(noteId);
    } finally {
      await relay.close();
    }
  };

  followPubkeys = async (toFollow: PublicKey[]) => {
    return followPubkeys(this.relay_url, toFollow, this);
  };

  unfollowPubkeys = async (toUnfollow: PublicKey[]) => {
    return unfollowPubkeys(this.relay_url, toUnfollow, this);
  };

  unfollowPubkey = async (pubkeyToUnfollow: PublicKey) => {
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }
    {
      const followingKeys = await this.getMyFollowingPubkeys();
      if (followingKeys instanceof Error) {
        return followingKeys;
      }

      // remove pubkey in tags
      followingKeys.delete(pubkeyToUnfollow.hex);
      const tags: Tag[] = Array.from(followingKeys).map((p) => ["p", p]);
      const new_event = await prepareNostrEvent(signer, {
        kind: NostrKind.CONTACTS,
        content: "",
        tags,
      });
      if (new_event instanceof Error) {
        return new_event;
      }

      const ok = await this.updateAccountFollowingList({ event: new_event });
      if (ok instanceof Error) {
        return ok;
      }
      return ok;
    }
  };

  submitAmbassadorApplication = async (args: {
    place: string;
    comment: string;
    email?: string;
    whatsapp?: string;
    telegram?: string;
    nostr_only: boolean;
    satlantis_pubkey: PublicKey;
    countryCode: string;
  }) => {
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    let content =
      "#Ambassador Application\n" +
      `Place: ${args.place}\n\n` +
      args.comment +
      "\n\n";
    if (args.nostr_only) {
      content += "Contact: Nostr Only\n";
    } else if (!args.email && !args.telegram && !args.whatsapp) {
      return new Error("need at least 1 contact method");
    } else {
      if (args.email) {
        content += `Email: ${args.email}\n`;
      }
      if (args.telegram) {
        content += `Telegram: ${args.telegram}\n`;
      }
      if (args.whatsapp) {
        content += `WhatsApp: ${args.whatsapp}\n`;
      }
    }

    const signedEvent = await prepareEncryptedNostrEvent(signer, {
      content,
      kind: NostrKind.DIRECT_MESSAGE,
      algorithm: "nip4",
      tags: [["p", args.satlantis_pubkey.hex]],
      encryptKey: args.satlantis_pubkey,
    });
    if (signedEvent instanceof Error) {
      return signedEvent;
    }

    const err2 = await this.postAmbassadorInquiry({
      countryCode: args.countryCode,
      kind4: signedEvent,
      placeName: args.place,
    });
    if (err2 instanceof Error) {
      return err2;
    }

    const relay = SingleRelayConnection.New(this.relay_url);
    if (relay instanceof Error) {
      return relay;
    }
    const err = await relay.sendEvent(signedEvent);
    await relay.close();
    if (err instanceof Error) {
      return err;
    }
    return signedEvent;
  };

  uploadFile = async (args: { file: File; directory?: string }) => {
    const res = await this.presign({
      filename: args.file.name,
      directory: args.directory,
    });
    if (res instanceof Error) {
      return res;
    }

    const response = await safeFetch(res.url, {
      method: "PUT",
      body: args.file,
      headers: {
        "Content-Type": args.file.type,
      },
    });
    if (response instanceof Error) {
      return response;
    }
    const _ = await response.text();
    if (_ instanceof Error) {
      return _;
    }
    const url = newURL(res.url);
    if (url instanceof Error) {
      return url;
    }
    return new URL(url.pathname, this.aws_cdn_url);
  };

  blacklistAccount = async (args: { pubkey: PublicKey }) => {
    const response = await this._blackListAccount({
      npub: args.pubkey.bech32(),
    });
    if (response instanceof Error) {
      return response;
    }

    return response;
  };

  /**
   * @param id
   *      PublicKey: get the user profile by Nostr Public Key
   *
   * @deprecated prefer to .resolver.getUser
   *  all resolver APIs will be moved to .resolve in the future
   * remove after: 2024/10/17
   */
  getUserProfile = async (
    pubkey: PublicKey | string
  ): Promise<UserResolver | Error> => {
    return this.resolver.getUser(pubkey);
  };

  getMyProfile = async (options?: {
    useCache: boolean;
  }): Promise<UserResolver | Error> => {
    if (options?.useCache && this.me) {
      return this.me;
    }
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    const me = await this.resolver.getUser(signer.publicKey, options);
    if (me instanceof Error) {
      return me;
    }

    this.me = me;
    return me;
  };

  updateMyProfile = async (metaData: Kind0MetaData) => {
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    if (this.me == undefined) {
      const currentProfile = await this.resolver.getUser(signer.publicKey);
      if (currentProfile instanceof Error) {
        return currentProfile;
      }
      this.me = currentProfile;
    }

    // deno-lint-ignore no-unused-vars -- removed banner from Nostr metaData
    const { banner, ...metaDataWithoutBanner } = metaData;
    const kind0 = await prepareKind0(signer, metaDataWithoutBanner);
    if (kind0 instanceof Error) {
      return kind0;
    }

    this.me.metaData = metaData;
    {
      const res = await this.updateAccount({
        npub: signer.publicKey.bech32(),
        data: {
          ...metaData,
          event: kind0,
        },
      });
      if (res instanceof Error) {
        return res;
      }
    }

    return this.me;
  };

  updateMyInterests = async (interests: string[]) => {
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    const event = await prepareNostrEvent(signer, {
      kind: NostrKind.Interests,
      tags: interests.map((i) => ["t", i]),
      content: "",
    });
    if (event instanceof Error) {
      return event;
    }

    const relay = SingleRelayConnection.New(this.relay_url);
    if (relay instanceof Error) {
      return relay;
    }
    const err = await relay.sendEvent(event);
    await relay.close();
    if (err instanceof Error) {
      return err;
    }
    if (this.me) {
      this.me.interests = interests;
    }
  };

  claimLocation = async (args: { locationId: number }) => {
    const err = await this.becomeBusinessAccount();
    if (err instanceof Error) {
      return err;
    }
    return this._claimLocation(args);
  };

  private becomeBusinessAccount = async () => {
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }
    const kind0 = await prepareKind0(signer, this.me?.metaData || {});
    if (kind0 instanceof Error) {
      return kind0;
    }
    const res = await this.updateAccount({
      npub: signer.publicKey.bech32(),
      data: {
        event: kind0,
        isBusiness: true,
      },
    });
    if (res instanceof Error) {
      return res;
    }
  };

  /**
   * get notes that are created by this pubkey
   *
   * @param args.page.after
   *      get notes after this time
   *      or from the beginning
   *
   * @unstbale
   */
  getNotesOf = async (args: {
    pubkey: PublicKey;
    page: {
      since?: Date;
      until?: Date;
      offset: number;
      limit: number;
    };
  }) => {
    const relay = SingleRelayConnection.New(this.relay_url);
    if (relay instanceof Error) return relay;

    const until = Math.floor(
      (Number(args.page.until || 0) || Date.now()) / 1000
    );
    const since = Math.floor(Number(args.page.since || 0) / 1000) || undefined;

    const sub = await relay.newSub("getNotesOf", {
      kinds: [NostrKind.TEXT_NOTE],
      authors: [args.pubkey.hex],
      limit: args.page.limit,
      since,
      until,
    });
    if (sub instanceof Error) {
      await relay.close();
      return sub;
    }

    async function* get(
      chan: AsyncIterable<RelayResponse_REQ_Message>,
      relay: SingleRelayConnection
    ) {
      for await (const msg of chan) {
        if (msg.type == "EOSE") {
          await relay.close();
          return;
        } else if (msg.type == "EVENT") {
          yield msg.event;
        } else {
          console.info(msg);
        }
      }
    }
    return get(sub.chan, relay);
  };

  /**
   * For note that contain multiple images, the image upload process can be completed in advance
   * @param args.content example: `${text}\n${imageUrl1}\n${imageUrl2}`
   *
   * @unstable
   */
  postPlaceMediaNote = async (args: {
    content: string;
    images: string[];
    placeID: number;
  }) => {
    const { content, placeID: placeId } = args;
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    const tags: Tag[] = [];
    for (const image of args.images) {
      tags.push(["image", image]);
    }

    const event = await prepareNostrEvent(signer, {
      kind: NostrKind.TEXT_NOTE,
      content,
      tags,
    });
    if (event instanceof Error) {
      return event;
    }

    const res = await this._postNote({
      event,
      noteType: NoteType.MEDIA,
      placeId,
    });
    return res;
  };

  /**
   * @param args.content example: `${text}`
   *
   * @unstable
   */
  postPlaceBasicNote = async (args: { content: string; placeID: number }) => {
    const { content, placeID: placeId } = args;
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    const event = await prepareNostrEvent(signer, {
      kind: NostrKind.TEXT_NOTE,
      content,
    });
    if (event instanceof Error) {
      return event;
    }

    const res = await this._postNote({
      event,
      noteType: NoteType.BASIC,
      placeId,
    });
    return res;
  };

  /**
   * @param args.placeEvent required if posting under a place/city
   *
   * @unstable
   */
  postNote = async (args: {
    content: string;
    image?: File | File[];
    iTag?: any[];
    eTag?: any[];
    pTag?: any[];
    qTag?: any[];
    placeID?: number;
    isRepost?: boolean;
    hasVideo?: boolean;
    thumbnail?: File;
  }) => {
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }
    let fullContent = `${args.content}`;

    const uploadedImageUrls: string[] = [];
    if (Array.isArray(args.image)) {
      for (const file of args.image) {
        const uploadedImageUrl = await this.uploadFile({ file });
        if (uploadedImageUrl instanceof Error) {
          return uploadedImageUrl;
        }
        uploadedImageUrls.push(uploadedImageUrl.toString());
      }
    } else if (args.image) {
      const uploadedImageUrl = await this.uploadFile({ file: args.image });
      if (uploadedImageUrl instanceof Error) {
        return uploadedImageUrl;
      }
      uploadedImageUrls.push(uploadedImageUrl.toString());
    }

    if (uploadedImageUrls.length > 0) {
      const imageUrlsString = uploadedImageUrls.join("\n");
      fullContent = `${args.content}\n${imageUrlsString}`;
    }

    const nostrProps: any = {
      kind: args.isRepost ? 6 : NostrKind.TEXT_NOTE,
      content: fullContent,
      tags: [],
    };
    if (args.iTag) {
      nostrProps.tags.push(args.iTag);
    }
    if (args.eTag) {
      nostrProps.tags.push(args.eTag);
    }
    if (args.pTag) {
      nostrProps.tags.push(args.pTag);
    }
    if (args.qTag) {
      nostrProps.tags.push(args.qTag);
    }

    // This image tag is used to display a thumbnail when notifying
    if (args.hasVideo) {
      if (args.thumbnail) {
        const uploadedThumbnailUrl = await this.uploadFile({
          file: args.thumbnail,
        });
        if (uploadedThumbnailUrl instanceof Error) {
          return uploadedThumbnailUrl;
        }
        nostrProps.tags.push(["image", uploadedThumbnailUrl.toString()]);
      }
    } else {
      for (const image of uploadedImageUrls) {
        nostrProps.tags.push(["image", image]);
      }
    }

    const event = await prepareNostrEvent(signer, nostrProps);
    if (event instanceof Error) {
      return event;
    }

    const res = await this._postNote({
      event,
      noteType:
        args.image || args.hasVideo
          ? NoteType.MEDIA
          : args.qTag
            ? NoteType.BASIC
            : NoteType.BASIC,
      placeId: args.placeID,
    });
    return res;
  };

  /**
   * reply/comment to an event
   *
   * @unstable
   */
  replyTo = async (args: { event: NostrEvent; content: string }) => {
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    // https://github.com/nostr-protocol/nips/blob/master/10.md#marked-e-tags-preferred
    const event = await prepareNostrEvent(signer, {
      kind: NostrKind.TEXT_NOTE,
      content: args.content,
      tags: [["e", args.event.id, this.relay_url, "reply"]],
    });
    if (event instanceof Error) {
      return event;
    }

    const res = await this._postNote({
      event,
      noteType: NoteType.BASIC,
    });
    if (res instanceof Error) {
      return res;
    }
  };

  /**
   * only business users/accounts can do it
   *
   * @unstable
   */
  postBusinessGalleryImage = async (args: { image: File }) => {
    const signer = await this.getNostrSigner();
    if (signer instanceof Error) {
      return signer;
    }

    const me = await this.getMyProfile();
    if (me instanceof Error) {
      return me;
    }
    const isBusiness = await me.getIsBusiness();
    if (isBusiness instanceof Error) {
      return isBusiness;
    }
    if (isBusiness != true) {
      return new Error("you are not a business user");
    }

    const uploadedImageUrl = await this.uploadFile({ file: args.image });
    if (uploadedImageUrl instanceof Error) {
      return uploadedImageUrl;
    }

    const fullContent = `${uploadedImageUrl}`;

    const event = await prepareNostrEvent(signer, {
      kind: NostrKind.TEXT_NOTE,
      content: fullContent,
    });
    if (event instanceof Error) {
      return event;
    }

    const res = await this._postNote({
      event,
      noteType: NoteType.GALLERY,
    });
    return res;
  };

  /**
   * https://github.com/nostr-protocol/nips/blob/master/25.md#reactions
   *
   * @unstable The return type might change
   */
  getLikesOfNote = async (args: { nostrID: string | NoteID }) => {
    if (typeof args.nostrID == "string") {
      args.nostrID = NoteID.FromString(args.nostrID);
    }
    const relay = SingleRelayConnection.New(this.relay_url);
    if (relay instanceof Error) {
      return relay;
    }

    const stream = await relay.newSub("getLikesOfNote", {
      "#e": [args.nostrID.hex],
      kinds: [NostrKind.REACTION],
    });
    if (stream instanceof Error) {
      await relay.close();
      return stream;
    }
    type x = typeof stream;
    async function* data(s: x) {
      for await (const msg of s.chan) {
        if (msg.type == "EOSE") {
          return;
        } else if (msg.type == "NOTICE") {
          console.debug(s.filters, msg.note);
          continue;
        }
        yield msg.event;
      }
    }
    return data(stream);
  };

  getAccountByUsername = async (args: { username: string }) => {
    const account = await this._getAccount(args);
    if (account instanceof Error) {
      return account;
    }
    return account;
  };

  getAccount = async (
    args: { npub: string },
    options?: { useCache: boolean }
  ) => {
    if (options?.useCache) {
      const account = this.accounts.get(args.npub);
      if (account) {
        return account;
      }
    }
    const account = await this._getAccount(args);
    if (account instanceof Error) {
      return account;
    }
    this.accounts.set(args.npub, account);
    return account;
  };

  getAccountFollowers = async (args: {
    npub: string;
    page: number;
    limit: number;
  }) => {
    const response = await this._getAccountFollowers(args);
    if (response instanceof Error) {
      return response;
    }
    return response;
  };

  getAccountFollowings = async (args: {
    npub: string;
    page: number;
    limit: number;
  }) => {
    const response = await this._getAccountFollowings(args);
    if (response instanceof Error) {
      return response;
    }
    return response;
  };

  fetchMetadataFromRelay = async (args: {
    relayUrl: string;
    limit: number;
    since: Date;
    pubkey: PublicKey;
  }): Promise<Kind0MetaData[] | Error> => {
    const metadataList: Kind0MetaData[] = [];

    // Establish a connection to the relay
    const relay = SingleRelayConnection.New(args.relayUrl, { log: true });
    if (relay instanceof Error) {
      return relay;
    }

    // Open a subscription stream on the relay
    const stream = await relay.newSub("fetchMetadata", {
      authors: [args.pubkey.hex],
      kinds: [0],
      limit: args.limit,
      since: Math.floor(args.since.valueOf() / 1000),
    });

    if (stream instanceof Error) {
      await relay.close();
      return stream;
    }

    // Process each message in the stream
    for await (const msg of stream.chan) {
      if (msg.type === "EOSE") {
        break;
      } else if (msg.type === "EVENT") {
        const metadata = JSON.parse(msg.event.content) as Kind0MetaData;
        metadataList.push(metadata);
      } else if (msg.type === "NOTICE") {
        console.warn(msg.note);
      }
    }

    // Close the relay connection
    await relay.close();

    return metadataList;
  };

  postLocationGalleryImage = async (args: {
    image: File | URL;
    locationID: number;
    category: ImageCategory;
    accountId: number;
    highlight: boolean;
  }) => {
    let imageUrl: string;

    if (args.image instanceof URL) {
      imageUrl = args.image.toString();
    } else {
      const uploadedImageUrl = await this.uploadFile({
        file: args.image,
        directory: "location_photos",
      });
      if (uploadedImageUrl instanceof Error) {
        return uploadedImageUrl;
      }
      imageUrl = uploadedImageUrl.toString();
    }

    const res = await this._postLocationGalleryImage({
      locationID: args.locationID,
      url: imageUrl,
      source: `user_${args.accountId}`,
      category: args.category,
      highlight: args.highlight,
    });
    if (res instanceof Error) {
      return res;
    }
    return res;
  };

  /**
   * Resolver APIs that provides callers a cleaner relationships among all data types
   * @unstable
   * @returns Resolver
   */
  resolver = {
    getUser: async (
      pubkey: PublicKey | string,
      options?: {
        useCache: boolean;
      }
    ): Promise<UserResolver | Error> => {
      if (typeof pubkey == "string") {
        const _pubkey = PublicKey.FromString(pubkey);
        if (_pubkey instanceof Error) {
          return _pubkey;
        }
        pubkey = _pubkey;
      }

      if (options?.useCache) {
        const user = this.users.get(pubkey.hex);
        if (user) {
          return user;
        }
      }

      const account = await this.getAccount(
        {
          npub: pubkey.bech32(),
        },
        options
      );
      if (account instanceof Error) {
        return account;
      }

      const user = new UserResolver(
        this,
        pubkey,
        account.isAdmin || false,
        account.isBusiness,
        account.nip05,
        {
          about: account.about,
          banner: account.banner,
          displayName: account.displayName,
          lud06: account.lud06,
          lud16: account.lud16,
          name: account.name,
          picture: account.picture,
          website: account.website,
        }
      );
      this.users.set(user.pubkey.hex, user);
      return user;
    },

    getUserByUsername: async (
      username: string
    ): Promise<UserResolver | Error> => {
      const account = await this.getAccountByUsername({ username });
      if (account instanceof Error) {
        return account;
      }
      const pubkey = PublicKey.FromString(account.pubKey);
      if (pubkey instanceof Error) {
        return pubkey;
      }
      return new UserResolver(
        this,
        pubkey,
        account.isAdmin || false,
        account.isBusiness,
        account.nip05,
        account
      );
    },

    getFollowers: async (args: {
      npub: string;
      page: number;
      limit: number;
    }): Promise<UserResolver[] | Error> => {
      const followers = [];
      const _followers = await this._getAccountFollowers(args);
      if (_followers instanceof Error) {
        return _followers;
      }

      for (const f of _followers) {
        const _pubkey = PublicKey.FromString(f.pubKey);
        if (_pubkey instanceof Error) {
          console.error(`Invalid pubkey: ${f.pubKey}`);
          continue;
        }
        followers.push(
          new UserResolver(this, _pubkey, f.isAdmin, f.isBusiness, f.nip05, f)
        );
      }
      return followers;
    },

    getFollowings: async (args: {
      npub: string;
      page: number;
      limit: number;
    }): Promise<UserResolver[] | Error> => {
      const followings = [];
      const response = await this._getAccountFollowings(args);
      if (response instanceof Error) {
        return response;
      }
      for (const f of response) {
        const _pubkey = PublicKey.FromString(f.pubKey);
        if (_pubkey instanceof Error) {
          console.error(`Invalid pubkey: ${f.pubKey}`);
          continue;
        }
        followings.push(
          new UserResolver(this, _pubkey, f.isAdmin, f.isBusiness, f.nip05, f)
        );
      }
      return followings;
    },

    /**
     * @unstable
     */
    getGlobalFeed: async (args: {
      page: number;
      limit: number;
      placeId?: string;
      secure?: boolean;
    }) => {
      const me = await this.getNostrSigner();
      if (me instanceof Error) {
        return me;
      }
      const notes = await this.getNotes({
        page: args.page,
        limit: args.limit,
        placeId: args.placeId,
        secure: args.secure,
      });
      if (notes instanceof Error) {
        return notes;
      }
      const noteResolvers = [];
      for (const note of notes) {
        const r = new NoteResolver(this, {
          type: "backend",
          data: note,
        });
        noteResolvers.push(r);
      }
      return noteResolvers;
    },
    /**
     * NOTE: This return result is not a NoteResolver, so it should not be written here.
     */
    getGlobalFeedsOfLoginUser: async (args: {
      page: number;
      limit: number;
      accountId?: number;
      shouldBuildFeed?: boolean;
      lastNoteId?: number;
      shouldWait?: boolean;
    }) => {
      const me = await this.getNostrSigner();
      if (me instanceof Error) {
        return me;
      }
      if (args.shouldBuildFeed) {
        if (args.shouldWait) {
          await this.buildGlobalFeed({
            accountId: args.accountId,
            secure: true,
            lastNoteId: args.lastNoteId,
          });
        } else {
          this.buildGlobalFeed({
            accountId: args.accountId,
            secure: true,
            lastNoteId: args.lastNoteId,
          });
        }
      }
      const notes = await this.getNotes({
        page: args.page,
        limit: args.limit,
        accountId: args.accountId,
        secure: true,
      });
      if (notes instanceof Error) {
        return notes;
      }
      return notes;
    },
    getLocationByID: async (id: number) => {
      const data = await this.getLocationByID({ id });
      if (data instanceof Error) {
        return data;
      }
      return new LocationResolver(this, data);
    },
    getLocationByGoogleId: async (googleId: string) => {
      const data = await this.getLocationByGoogleId({ googleId });
      if (data instanceof Error) {
        return data;
      }
      return new LocationResolver(this, data);
    },
    /**
     * @unstable
     */
    getOwnerForLocation: async (args: { locationId: number }) => {
      const accounts = await this.getAccountsForLocation({
        locationId: args.locationId,
      });
      if (accounts instanceof Error) {
        return accounts;
      }
      // https://linear.app/sat-lantis/issue/SAT-1161/endpoint-getaccountsforlocationlocationid#comment-18c9a50c
      if (accounts.length > 1) {
        console.warn(
          `more than one owner for the location, locationId: ${args.locationId}`
        );
      }
      for (const account of accounts) {
        const pubkey = PublicKey.FromHex(account.pubKey);
        if (pubkey instanceof Error) {
          return pubkey;
        }
        return new UserResolver(
          this,
          pubkey,
          account.isAdmin,
          account.isBusiness,
          account.nip05,
          account
        );
      }
    },
    /**
     * @unstable
     */
    getNotesOfPubkey: async (args: {
      page: number;
      limit: number;
      npub: string;
    }) => {
      const notes = await this.getNotesOfPubkey(args);
      if (notes instanceof Error) {
        return notes;
      }
      const noteResolvers = [];
      for (const note of notes) {
        const r = new NoteResolver(this, {
          type: "backend",
          data: note,
        });
        noteResolvers.push(r);
      }
      return noteResolvers;
    },
    /**
     * @unstable
     */
    getNote: async (args: { noteID: number; accountID?: number }) => {
      const note = await this.getNote(args);
      if (note instanceof Error) {
        return note;
      }
      return new NoteResolver(this, {
        type: "backend",
        data: note,
      });
    },
    /**
     * @unstable
     */
    getNoteCommentsById: async (args: {
      accountID?: number | undefined;
      noteID: number;
      page: number;
      limit: number;
    }) => {
      const notes = await this.getNoteCommentsById(args);
      if (notes instanceof Error) {
        return notes;
      }
      const noteResolvers = [];
      for (const note of notes) {
        const r = new NoteResolver(this, {
          type: "backend",
          data: note,
        });
        noteResolvers.push(r);
      }
      return noteResolvers;
    },
    /**
     * @unstable
     */
    getLocationsBySearch: async (args: {
      rating: number;
      search?: string;
      category?: string;
      place_id?: number;
      limit?: number;
      page?: number;
      sortColumn?: string;
      sortDirection?: "asc" | "desc";
    }) => {
      const locations = await this.getLocationsBySearch(args);
      if (locations instanceof Error) {
        return locations;
      }
      return locations.map((l) => new LocationResolver(this, l));
    },
    /**
     * @unstable
     */
    getLocationsByPlaceIDRandomized: async (args: {
      placeId: number;
      tags?: { key: string; value: string }[];
    }) => {
      const locations = await this.getLocationsByPlaceIDRandomized(args);
      if (locations instanceof Error) {
        return locations;
      }
      return locations.map((l) => new LocationResolver(this, l));
    },
  };
}

// api
export * from "./api/location.ts";
export * from "./api/login.ts";
export * from "./api/nip5.ts";
export * from "./api/note.ts";
export * from "./api/people.ts";
export * from "./api/place.ts";
export * from "./api/share_types.ts";
export * from "./api/secure/account.ts";
export * from "./api/secure/presign.ts";
export * from "./api/secure/place.ts";
// types
export * from "./models/account.ts";
export * from "./models/calendar.ts";
export * from "./models/chat.ts";
export * from "./models/location.ts";
export * from "./models/metric.ts";
export * from "./models/notification.ts";
export * from "./models/place.ts";
export * from "./models/region.ts";
export * from "./models/interest.ts";
export * from "./models/reaction.ts";
export * from "./models/collection.ts";
export * from "./models/activity.ts";
// data resolvers
export * from "./resolvers/location.ts";
export * from "./resolvers/user.ts";
// nostr helpers
export * from "./event-handling/parser.ts";
export {
  followPubkeys,
  getContactList,
  isUserAFollowingUserB,
} from "./nostr-helpers.ts";

////////////////////////////////
// Private/Unexported Helpers //
////////////////////////////////
async function prepareKind0(signer: Signer, metadata: Kind0MetaData) {
  return await prepareNostrEvent(signer, {
    content: JSON.stringify(metadata),
    kind: NostrKind.META_DATA,
  });
}

function convertToLocationCategories(
  locationTags: LocationTag[]
): LocationCategory[] {
  const categoryMap = new Map<LocationCategoryName, Map<string, Set<string>>>();

  locationTags.forEach((tag) => {
    const category = tag.category as unknown as LocationCategoryName;
    if (!categoryMap.has(category)) {
      categoryMap.set(category, new Map<string, Set<string>>());
    }

    const subCategoryMap = categoryMap.get(category)!;
    if (!subCategoryMap.has(tag.key)) {
      subCategoryMap.set(tag.key, new Set<string>());
    }

    subCategoryMap.get(tag.key)!.add(tag.value);
  });

  const locationCategories: LocationCategory[] = Array.from(
    categoryMap.entries()
  ).map(
    ([name, subCategoryMap]): LocationCategory => ({
      name,
      subCategory: Array.from(subCategoryMap.entries()).map(
        ([key, valueSet]) => ({
          key,
          value: Array.from(valueSet),
        })
      ),
    })
  );

  return locationCategories;
}
