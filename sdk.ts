import {
    type Encrypter,
    type NostrEvent,
    NostrKind,
    parseJSON,
    prepareEncryptedNostrEvent,
    prepareNostrEvent,
    PublicKey,
    type Signer,
    SingleRelayConnection,
    type Tag,
} from "@blowater/nostr-sdk";

import {
    createAccount,
    getAccount,
    initiatePasswordReset,
    login,
    resetPassword,
    verifyEmail,
} from "./api/account.ts";
import { getIpInfo } from "./api/ip.ts";
import { getLocationReviews, getLocationsWithinBoundingBox, getLocationTags } from "./api/location.ts";
import { loginNostr } from "./api/login.ts";
import { getNote, getNotes, NoteType } from "./api/note.ts";
import { getAccountPlaceRoles } from "./api/people.ts";
import {
    getPlace,
    getPlaceCalendarEvents,
    getPlaceCategoryScores,
    getPlaceChats,
    getPlaceEvent,
    getPlaceGallery,
    getPlaceMetrics,
    getPlaceNoteFeed,
    getPlaces,
    getRegion,
} from "./api/place.ts";
import {
    addAccountRole,
    removeAccountRole,
    updateAccount,
    updateAccountFollowingList,
} from "./api/secure/account.ts";
import { updatePlace } from "./api/secure/place.ts";
import { postNote, postReaction } from "./api/secure/note.ts";
import { presign } from "./api/secure/presign.ts";
import { newURL } from "./helpers/_helper.ts";
import { addressLookup } from "./api/address.ts";
import { signEvent } from "./api/nostr_event.ts";
import { getInterests } from "./api/secure/interests.ts";
import { postCalendarEventRSVP } from "./api/secure/calendar.ts";
import type { CalendarEventType } from "./models/calendar.ts";
import { Hashtag } from "./api/calendar.ts";
import { followPubkeys, getFollowingPubkeys, getInterestsOf } from "./nostr-helpers.ts";
import { getPubkeyByNip05 } from "./api/nip5.ts";
import { safeFetch } from "./helpers/safe-fetch.ts";
import type { Kind0MetaData } from "./models/account.ts";
import { UserResolver } from "./resolvers/user.ts";

export type func_GetNostrSigner = () => Promise<Signer & Encrypter | Error>;
export type func_GetJwt = () => string;

export class Client {
    private myProfile: UserResolver | undefined = undefined;

    // Place
    getAccountPlaceRoles: ReturnType<typeof getAccountPlaceRoles>;
    getPlace: ReturnType<typeof getPlace>;
    getPlaces: ReturnType<typeof getPlaces>;
    getPlaceEvent: ReturnType<typeof getPlaceEvent>;
    getPlaceNoteFeed: ReturnType<typeof getPlaceNoteFeed>;
    getPlaceMetrics: ReturnType<typeof getPlaceMetrics>;
    getPlaceGallery: ReturnType<typeof getPlaceGallery>;
    getPlaceChats: ReturnType<typeof getPlaceChats>;
    getPlaceCategoryScores: ReturnType<typeof getPlaceCategoryScores>;
    getLocationsWithinBoundingBox: ReturnType<typeof getLocationsWithinBoundingBox>;
    getRegion: ReturnType<typeof getRegion>;

    // Calendar Events
    getPlaceCalendarEvents: ReturnType<typeof getPlaceCalendarEvents>;
    postCalendarEventRSVP: ReturnType<typeof postCalendarEventRSVP>;

    // Account
    /**
     * @unstable
     */
    getAccount: ReturnType<typeof getAccount>;
    createAccount: ReturnType<typeof createAccount>;
    /**
     * @unstable
     */
    private updateAccount: ReturnType<typeof updateAccount>;

    getNotes: ReturnType<typeof getNotes>;
    getNote: ReturnType<typeof getNote>;
    getIpInfo: ReturnType<typeof getIpInfo>;
    getLocationReviews: ReturnType<typeof getLocationReviews>;
    addressLookup: ReturnType<typeof addressLookup>;

    // auth
    loginNostr: ReturnType<typeof loginNostr>;
    login: ReturnType<typeof login>;
    initiatePasswordReset: ReturnType<typeof initiatePasswordReset>;
    resetPassword: ReturnType<typeof resetPassword>;
    verifyEmail: ReturnType<typeof verifyEmail>;
    /////////////////
    // authed APIs //
    /////////////////
    // acount role
    removeAccountRole: ReturnType<typeof removeAccountRole>;
    addAccountRole: ReturnType<typeof addAccountRole>;
    updateAccountFollowingList: ReturnType<typeof updateAccountFollowingList>;
    getInterests: ReturnType<typeof getInterests>;

    // nostr note
    postNote: ReturnType<typeof postNote>;
    postReaction: ReturnType<typeof postReaction>;
    signEvent: ReturnType<typeof signEvent>;

    // s3
    private presign: ReturnType<typeof presign>;

    // place
    updatePlace: ReturnType<typeof updatePlace>;

    private constructor(
        public readonly url: URL,
        public readonly relay_url: string,
        public readonly getJwt: func_GetJwt,
        public readonly getNostrSigner: func_GetNostrSigner,
    ) {
        this.getPlace = getPlace(url);
        this.getPlaces = getPlaces(url);
        this.getAccountPlaceRoles = getAccountPlaceRoles(url);
        this.getPlaceNoteFeed = getPlaceNoteFeed(url);
        this.getPlaceMetrics = getPlaceMetrics(url);
        this.getPlaceGallery = getPlaceGallery(url);
        this.getPlaceChats = getPlaceChats(url);
        this.getPlaceCategoryScores = getPlaceCategoryScores(url);
        this.getPlaceEvent = getPlaceEvent(url);
        this.getLocationsWithinBoundingBox = getLocationsWithinBoundingBox(url);
        this.getRegion = getRegion(url);

        // Calendar Events
        this.getPlaceCalendarEvents = getPlaceCalendarEvents(url);
        this.postCalendarEventRSVP = postCalendarEventRSVP(url, getJwt, getNostrSigner);

        this.getAccount = getAccount(url);
        this.createAccount = createAccount(url);
        this.updateAccount = updateAccount(url, getJwt);

        this.getNotes = getNotes(url);
        this.getNote = getNote(url);
        this.getIpInfo = getIpInfo(url);
        this.getLocationReviews = getLocationReviews(url);
        this.addressLookup = addressLookup(url);

        // authed APIs
        this.removeAccountRole = removeAccountRole(url, this.getJwt, this.getNostrSigner);
        this.addAccountRole = addAccountRole(url, this.getJwt, this.getNostrSigner);
        this.updateAccountFollowingList = updateAccountFollowingList(
            url,
            this.getJwt,
            this.getNostrSigner,
        );
        this.presign = presign(url, getJwt, getNostrSigner);
        this.postReaction = postReaction(url, this.getJwt);
        this.postNote = postNote(url, this.getJwt);
        this.signEvent = signEvent(url, getJwt);
        this.updatePlace = updatePlace(url, this.getJwt);

        // sign-in / sign-up
        this.login = login(url);
        this.loginNostr = loginNostr(url);
        this.initiatePasswordReset = initiatePasswordReset(this.url);
        this.resetPassword = resetPassword(this.url);
        this.verifyEmail = verifyEmail(this.url);
        this.getInterests = getInterests(this.url);
    }

    static New(args: {
        baseURL: string | URL;
        relay_url: string;
        getJwt?: () => string;
        getNostrSigner?: func_GetNostrSigner;
    }) {
        const validURL = newURL(args.baseURL);
        if (validURL instanceof Error) {
            return validURL;
        }
        if (args.getJwt == undefined) {
            args.getJwt = () => "";
        }
        if (args.getNostrSigner == undefined) {
            args.getNostrSigner = async () => new Error("nostr signer is not provided");
        }
        return new Client(validURL, args.relay_url, args.getJwt, args.getNostrSigner);
    }

    getLocationTags = () => {
        return getLocationTags(this.url)();
    };

    createCalendarEvent = async (args: {
        description: string;
        placeATag: string;
        calendarEventType: CalendarEventType;
        url: string;
        title: string;
        imageURL: string;
        // todo: use RFC3339 / ISO8601 format
        startDate: string;
        endDate: string;
        timezone: string;
        geoHash: string;
        location: string;
        placeID?: number;
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
            kind: NostrKind.Calendar_Time,
            content: args.description,
            tags: [
                ["a", args.placeATag],
                ["d", crypto.randomUUID()],
                ["t", Hashtag(args.calendarEventType)],
                ["r", args.url],
                ["title", args.title],
                ["image", args.imageURL],
                ["start", Math.floor(new Date(args.startDate).getTime() / 1000).toString()],
                ["end", Math.floor(new Date(args.endDate).getTime() / 1000).toString()],
                ["start_tzid", args.timezone],
                ["g", args.geoHash],
                ["location", args.location],
            ],
        });
        if (event instanceof Error) {
            return event;
        }

        const res = await this.postNote({
            placeId: args.placeID,
            event,
            noteType: NoteType.CALENDAR_EVENT,
        });
        if (res instanceof Error) {
            return res;
        }
        return { postResult: res, event };
    };

    async getInterestsOf(pubkey: PublicKey) {
        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }
        const res = await getInterestsOf(relay, pubkey);
        await relay.close();
        return res;
    }

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
            kind: NostrKind.Interests,
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

    /**
     * Checks the availability of a NIP05 address on a given domain.
     */
    checkUsernameAvailability = async (userName: string) => {
        let domain;
        if (this.url.host == "api-dev.satlantis.io") {
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

    followPubkeys = async (toFollow: PublicKey[]) => {
        return followPubkeys(this.relay_url, toFollow, this);
    };

    unfollowPubkey = async (pubkeyToUnfollow: PublicKey) => {
        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }
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

            const err = await relay.sendEvent(new_event);
            if (err instanceof Error) {
                return err;
            }

            const ok = await this.updateAccountFollowingList({ event: new_event });
            if (ok instanceof Error) {
                return ok;
            }
            await relay.close();
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
    }) => {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }

        let content = "#Ambassador Application\n" + `Place: ${args.place}\n\n` + args.comment + "\n\n";
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

    uploadFile = async (args: { file: File }) => {
        const res = await this.presign({ filename: args.file.name });
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
        url.search = "";
        return url;
    };

    /**
     * @param id
     *      PublicKey: get the user profile by Nostr Public Key
     * @returns
     */
    getUserProfile = async (pubkey: PublicKey): Promise<UserResolver | Error> => {
        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }
        const profile = await getUserProfile(pubkey, relay, this);
        await relay.close();
        return profile;
    };

    getMyProfile = async (): Promise<UserResolver | Error> => {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }
        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }
        const profile = await getUserProfile(signer.publicKey, relay, this);
        await relay.close();
        if (profile instanceof Error) {
            return profile;
        }
        this.myProfile = profile;
        return profile;
    };

    updateMyProfile = async (metaData: Kind0MetaData) => {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }
        const relay = SingleRelayConnection.New(this.relay_url);
        if (relay instanceof Error) {
            return relay;
        }

        if (this.myProfile == undefined) {
            const currentProfile = await getUserProfile(signer.publicKey, relay, this);
            if (currentProfile instanceof Error) {
                await relay.close();
                return currentProfile;
            }
            this.myProfile = currentProfile;
        }

        const kind0 = await prepareKind0(signer, metaData);
        if (kind0 instanceof Error) {
            await relay.close();
            return kind0;
        }

        this.myProfile = UserResolver.New(signer.publicKey, metaData, {
            client: this,
        });

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

        const res = await relay.sendEvent(kind0);
        await relay.close();
        if (res instanceof Error) {
            return res;
        }

        return this.myProfile;
    };

    becomeBusinessAccount = async () => {
        const signer = await this.getNostrSigner();
        if (signer instanceof Error) {
            return signer;
        }
        // this.getMyProfile()
        // this.updateAccount({
        //     npub: signer.publicKey.bech32(),
        //     data: {
        //         isBusiness: true
        //     }
        // })
    };
}

// api
export * from "./api/calendar.ts";
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
export * from "./models/place.ts";
export * from "./models/region.ts";
export * from "./models/interest.ts";
// nostr helpers
export * from "./event-handling/parser.ts";
export { followPubkeys, getContactList, isUserAFollowingUserB } from "./nostr-helpers.ts";

////////////////////////////////
// Private/Unexported Helpers //
////////////////////////////////

/**
 * also known as a nostr pubkey profile
 */
async function get_kind0_META_DATA(relay: SingleRelayConnection, pubkey: PublicKey) {
    return await relay.getReplaceableEvent(pubkey, NostrKind.META_DATA);
}

const getUserProfile = async (
    pubkey: PublicKey,
    relay: SingleRelayConnection,
    client: Client,
): Promise<UserResolver | Error> => {
    const kind0 = await get_kind0_META_DATA(relay, pubkey);
    if (kind0 instanceof Error) {
        return kind0;
    }
    if (kind0 == undefined) {
        return UserResolver.New(pubkey, {}, { client });
    }

    const metadata = parseJSON<Kind0MetaData>(kind0.content);
    if (metadata instanceof Error) {
        return metadata;
    }
    const profile = UserResolver.New(pubkey, metadata, { client });
    return profile;
};

async function prepareKind0(signer: Signer, metadata: Kind0MetaData) {
    return await prepareNostrEvent(signer, {
        content: JSON.stringify(metadata),
        kind: NostrKind.META_DATA,
    });
}
