/**
 * Primitives shared by the event and community invitation endpoints. Mirrors
 * the backend's `shared/invitation.models.go`, which both domains' handlers
 * decode into, so a change on either side has one place to land here.
 */

/**
 * One invitee, identified by email address, npub, or account ID (as a string).
 * `name` seeds the resolved account's name and display name, and is ignored
 * when that account already has either.
 */
export interface InvitationContact {
    identifier: string;
    name?: string;
}

/**
 * A single input - an email address, an npub, or an account ID - that could not
 * be invited, together with a human-readable reason.
 */
export interface InvitationFailure {
    identifier: string;
    reason: string;
}

/** The backend rejects a batch larger than this with a 400. */
export const MAX_INVITATION_CONTACTS = 200;
