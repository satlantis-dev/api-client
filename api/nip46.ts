import {
    ConnectionPool,
    InMemoryAccountContext,
    type NostrAccountContext,
    type NostrEvent,
    NostrKind,
    PrivateKey,
    PublicKey,
    type UnsignedNostrEvent,
} from "@blowater/nostr-sdk";

const NIP46_KIND = 24133 as NostrKind;

type Nip46RequestPayload = {
    id: string;
    method: string;
    params: string[];
};

type Nip46ResponsePayload = {
    id?: string;
    result?: string;
    error?: string;
};

type PendingRequest = {
    resolve: (value: string) => void;
    reject: (error: Error) => void;
    timeoutId: ReturnType<typeof setTimeout>;
};

export type Nip46SignerRequestErrorHandler = (method: string, error: Error) => void;

export type Nip46Options = {
    relays: string[];
    callback?: string;
    appName?: string;
    appUrl?: string;
    appImage?: string;
    perms?: string[];
    connectTimeoutMs?: number;
    onSignerRequestError?: Nip46SignerRequestErrorHandler;
};

export type Nip46PersistedSession = {
    clientSecretKeyHex: string;
    remoteSignerPubkey: string;
    userPubkey: string;
    relays: string[];
};

export class Nip46InvalidStateError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "Nip46InvalidStateError";
    }
}

export type Nip46Session = {
    nostrConnectUri: string;
    signerPromise: Promise<NostrAccountContext | Error>;
    getPersistedState: () => Nip46PersistedSession | undefined;
    logout: (timeoutMs?: number) => Promise<void>;
    close: () => Promise<void>;
};

export type Nip46RestoredSession = {
    signerPromise: Promise<NostrAccountContext | Error>;
    getPersistedState: () => Nip46PersistedSession;
    logout: (timeoutMs?: number) => Promise<void>;
    close: () => Promise<void>;
};

class Nip46RemoteSigner implements NostrAccountContext {
    constructor(
        public readonly publicKey: PublicKey,
        private readonly request: (
            method: string,
            params: string[],
        ) => Promise<string | Error>,
    ) {}

    async encrypt(
        pubkey: string,
        plaintext: string,
        algorithm: "nip44" | "nip4",
    ) {
        const method = algorithm === "nip44" ? "nip44_encrypt" : "nip04_encrypt";
        return await this.request(method, [pubkey, plaintext]);
    }

    async decrypt(
        pubkey: string,
        ciphertext: string,
        algorithm?: "nip44" | "nip4",
    ) {
        const method = algorithm === "nip4" ? "nip04_decrypt" : "nip44_decrypt";
        return await this.request(method, [pubkey, ciphertext]);
    }

    async signEvent<T extends NostrKind>(
        event: UnsignedNostrEvent<T>,
    ): Promise<NostrEvent<T> | Error> {
        const signed = await this.request("sign_event", [JSON.stringify(event)]);
        if (signed instanceof Error) {
            return signed;
        }

        try {
            return JSON.parse(signed) as NostrEvent<T>;
        } catch (e) {
            return e instanceof Error ? e : new Error("Failed to parse signed event");
        }
    }
}

function randomString(size = 8) {
    const bytes = new Uint8Array(size);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function buildNostrConnectURI(
    clientPubkey: string,
    {
        relays,
        callback,
        appName = "Satlantis",
        appUrl,
        appImage,
        perms = [
            "nip04_encrypt",
            "nip04_decrypt",
            "nip44_encrypt",
            "nip44_decrypt",
            "sign_event:1",
            "sign_event:4",
            "sign_event:7",
            "sign_event:5",
        ],
        secret,
    }: {
        relays: string[];
        callback?: string;
        appName?: string;
        appUrl?: string;
        appImage?: string;
        perms?: string[];
        secret: string;
    },
) {
    const params = new URLSearchParams();

    for (const relay of relays) {
        params.append("relay", relay);
    }

    params.set("secret", secret);
    params.set("name", appName);
    params.set("perms", perms.join(","));
    params.set(
        "metadata",
        JSON.stringify({
            name: appName,
            ...(appUrl ? { url: appUrl } : {}),
            ...(appImage ? { icons: [appImage] } : {}),
        }),
    );

    if (callback) {
        params.set("callback", callback);
    }

    if (appUrl) {
        params.set("url", appUrl);
    }

    if (appImage) {
        params.set("image", appImage);
    }

    return `nostrconnect://${clientPubkey}?${params.toString()}`;
}

const DEFAULT_RELAYS = ["wss://nrs.primal.net"];

const RELAY_OPEN_WAIT_MS = 10_000;
const RELAY_OPEN_POLL_MS = 100;
const REQUEST_TIMEOUT_MS = 45_000;
const LOGOUT_TIMEOUT_MS = 3_000;

function withSignerRequestErrorHandler(
    request: Nip46Transport["request"],
    onError: Nip46SignerRequestErrorHandler | undefined,
): (method: string, params: string[]) => Promise<string | Error> {
    return async (method, params) => {
        const result = await request(method, params);
        if (result instanceof Error && result.message !== "NIP46 session closed") {
            try {
                onError?.(method, result);
            } catch {
                // A failing hook must not change the request result.
            }
        }
        return result;
    };
}

// "logout" is a Primal-specific (non-standard) method: the signer acks and
// deletes this connection. It is ignored when the signer has no open session,
// so the wait covers the whole attempt (relay wait included) and never throws.
async function logoutAndClose(
    transport: Nip46Transport,
    canSend: boolean,
    close: () => Promise<void>,
    timeoutMs: number,
): Promise<void> {
    if (canSend && !transport.isClosed()) {
        let timerId: ReturnType<typeof setTimeout> | undefined;
        try {
            await Promise.race([
                transport.request("logout", [], timeoutMs),
                new Promise<void>((resolve) => {
                    timerId = setTimeout(resolve, timeoutMs);
                }),
            ]);
        } catch {
            // Best effort.
        } finally {
            clearTimeout(timerId);
        }
    }

    try {
        await close();
    } catch {
        // Best effort.
    }
}

type Nip46Stream = Exclude<Awaited<ReturnType<typeof openNip46Subscription>>, Error>;

type Nip46Transport = {
    request: (method: string, params: string[], timeoutMs?: number) => Promise<string | Error>;
    setup: Promise<Nip46Stream | Error>;
    consume: (
        stream: Nip46Stream,
        onPayload?: (payload: Nip46ResponsePayload, event: NostrEvent) => boolean,
    ) => Promise<void>;
    isClosed: () => boolean;
    close: () => Promise<void>;
};

function createNip46Transport(args: {
    localSigner: InMemoryAccountContext;
    relays: string[];
    getRemoteSignerPubkey: () => string;
    setupErrorMessage: string;
    tolerateRelayFailure: boolean;
}): Nip46Transport {
    const { localSigner, relays, getRemoteSignerPubkey, setupErrorMessage, tolerateRelayFailure } = args;
    const pool = new ConnectionPool({ signer: localSigner });
    const pendingRequests = new Map<string, PendingRequest>();
    let closed = false;
    let closePromise: Promise<void> | undefined;
    let stream: Nip46Stream | undefined;

    const isClosed = () => closed;

    const setup = (async (): Promise<Nip46Stream | Error> => {
        try {
            const opened = await openNip46Subscription(
                pool,
                localSigner.publicKey.hex,
                relays,
                tolerateRelayFailure,
            );
            if (!(opened instanceof Error)) {
                stream = opened;
            }
            return opened;
        } catch (error) {
            return error instanceof Error ? error : new Error(setupErrorMessage);
        }
    })();

    const consume: Nip46Transport["consume"] = async (streamToConsume, onPayload) => {
        for await (const msg of streamToConsume.chan) {
            if (closed) {
                break;
            }

            if (msg.res.type !== "EVENT" || !msg.res.event) {
                continue;
            }

            const event = msg.res.event;
            const remoteSignerPubkey = getRemoteSignerPubkey();
            if (remoteSignerPubkey !== "" && event.pubkey !== remoteSignerPubkey) {
                continue;
            }
            const decrypted = await localSigner.decrypt(
                event.pubkey,
                event.content,
                "nip44",
            );
            if (decrypted instanceof Error) {
                continue;
            }

            let payload: Nip46ResponsePayload;
            try {
                payload = JSON.parse(decrypted) as Nip46ResponsePayload;
            } catch {
                continue;
            }

            if (onPayload?.(payload, event)) {
                continue;
            }

            if (!payload.id) {
                continue;
            }

            const pending = pendingRequests.get(payload.id);
            if (!pending) {
                continue;
            }

            clearTimeout(pending.timeoutId);
            pendingRequests.delete(payload.id);

            if (payload.error) {
                pending.reject(new Error(payload.error));
                continue;
            }

            pending.resolve(payload.result ?? "");
        }
    };

    const hasOpenRelay = () => Array.from(pool.getRelays()).some((relay) => relay.status() === "Open");

    const ensureRelayOpen = async (): Promise<Error | undefined> => {
        await setup;
        if (closed) {
            return new Error("NIP46 session closed");
        }

        if (!stream) {
            const opened = await openNip46Subscription(pool, localSigner.publicKey.hex, relays, true);
            if (opened instanceof Error) {
                return opened;
            }
            stream = opened;
            consume(opened).catch(() => {
            });
        } else if (Array.from(pool.getRelays()).length === 0) {
            await pool.addRelayURLs(relays);
        }

        const deadline = Date.now() + RELAY_OPEN_WAIT_MS;
        while (!hasOpenRelay()) {
            if (closed) {
                return new Error("NIP46 session closed");
            }
            if (Date.now() >= deadline) {
                return new Error("NIP46 relay is not connected");
            }
            await new Promise((resolve) => setTimeout(resolve, RELAY_OPEN_POLL_MS));
        }
        return undefined;
    };

    const request: Nip46Transport["request"] = async (method, params, timeoutMs = REQUEST_TIMEOUT_MS) => {
        if (closed) {
            return new Error("NIP46 session closed");
        }

        const remoteSignerPubkey = getRemoteSignerPubkey();
        if (remoteSignerPubkey === "") {
            return new Error("NIP46 remote signer is not connected");
        }

        const id = randomString(10);
        const payload: Nip46RequestPayload = {
            id,
            method,
            params,
        };

        const encrypted = await localSigner.encrypt(
            remoteSignerPubkey,
            JSON.stringify(payload),
            "nip44",
        );

        if (encrypted instanceof Error) {
            return encrypted;
        }

        const unsigned: UnsignedNostrEvent = {
            pubkey: localSigner.publicKey.hex,
            kind: NIP46_KIND,
            created_at: Math.floor(Date.now() / 1000),
            tags: [["p", remoteSignerPubkey]],
            content: encrypted,
        };

        const signed = await localSigner.signEvent(unsigned);
        if (signed instanceof Error) {
            return signed;
        }

        const relayError = await ensureRelayOpen();
        if (relayError) {
            return relayError;
        }
        if (closed) {
            return new Error("NIP46 session closed");
        }

        const responsePromise = new Promise<string>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                pendingRequests.delete(id);
                reject(new Error(`NIP46 request timed out: ${method}`));
            }, timeoutMs);

            pendingRequests.set(id, {
                resolve,
                reject,
                timeoutId,
            });
        });

        const sent = await pool.sendEvent(signed);
        if (sent instanceof Error) {
            const pending = pendingRequests.get(id);
            if (pending) {
                clearTimeout(pending.timeoutId);
                pendingRequests.delete(id);
            }
            return sent;
        }

        try {
            return await responsePromise;
        } catch (e) {
            return e instanceof Error ? e : new Error("NIP46 request failed");
        }
    };

    const close = async () => {
        if (closePromise) {
            return closePromise;
        }
        closed = true;

        const reason = new Error("NIP46 session closed");
        for (const pending of pendingRequests.values()) {
            clearTimeout(pending.timeoutId);
            pending.reject(reason);
        }
        pendingRequests.clear();

        closePromise = (async () => {
            await setup;
            await pool.close();
        })();
        return closePromise;
    };

    return { request, setup, consume, isClosed, close };
}

// Register the subscription before connecting relays. ConnectionPool
// can then finish wiring it synchronously during addRelayURLs, which
// avoids a close/newSub race when the user switches login methods.
async function openNip46Subscription(
    pool: ConnectionPool,
    clientPubkeyHex: string,
    relays: string[],
    tolerateRelayFailure: boolean,
) {
    const subId = `nip46-${randomString(8)}`;
    const stream = await pool.newSub(subId, {
        kinds: [NIP46_KIND],
        "#p": [clientPubkeyHex],
        limit: 100,
    });
    if (stream instanceof Error) {
        return stream;
    }

    const relayErrors = await pool.addRelayURLs(relays);
    if (!tolerateRelayFailure && relayErrors && relayErrors.length === relays.length) {
        return relayErrors[0];
    }

    return stream;
}

export function isNip46PersistedSession(value: unknown): value is Nip46PersistedSession {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const state = value as Record<string, unknown>;
    const isFilledString = (field: unknown) => typeof field === "string" && field !== "";
    return (
        isFilledString(state.clientSecretKeyHex) &&
        isFilledString(state.remoteSignerPubkey) &&
        isFilledString(state.userPubkey) &&
        Array.isArray(state.relays) &&
        state.relays.every((relay) => typeof relay === "string")
    );
}

export function createNip46Session(options: Nip46Options): Nip46Session {
    const localSigner = InMemoryAccountContext.Generate();
    const secret = randomString(12);
    const relays = options.relays.length > 0 ? options.relays : DEFAULT_RELAYS;

    let remoteSignerPubkey = "";
    let persistedState: Nip46PersistedSession | undefined;
    const transport = createNip46Transport({
        localSigner,
        relays,
        getRemoteSignerPubkey: () => remoteSignerPubkey,
        setupErrorMessage: "Failed to start NIP46 session",
        tolerateRelayFailure: false,
    });

    let connectTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let rejectConnect: ((error: Error) => void) | undefined;

    const signerPromise = (async (): Promise<NostrAccountContext | Error> => {
        const setupResult = await transport.setup;
        if (setupResult instanceof Error) {
            return setupResult;
        }
        if (transport.isClosed()) {
            return new Error("NIP46 session closed");
        }
        const stream = setupResult;

        const connectDeferred = new Promise<void>((resolve, reject) => {
            rejectConnect = reject;
            const timeoutMs = options.connectTimeoutMs ?? 180_000;
            connectTimeoutId = setTimeout(() => {
                rejectConnect = undefined;
                reject(new Error("Timed out waiting for approval"));
            }, timeoutMs);

            transport.consume(stream, (payload, event) => {
                if (payload.result !== secret || remoteSignerPubkey !== "") {
                    return false;
                }
                remoteSignerPubkey = event.pubkey;
                if (connectTimeoutId) {
                    clearTimeout(connectTimeoutId);
                    connectTimeoutId = undefined;
                }
                rejectConnect = undefined;
                resolve();
                return true;
            }).catch((error) => {
                if (connectTimeoutId) {
                    clearTimeout(connectTimeoutId);
                    connectTimeoutId = undefined;
                }
                rejectConnect = undefined;
                reject(
                    error instanceof Error ? error : new Error("NIP46 stream failed"),
                );
            });
        });

        try {
            await connectDeferred;
        } catch (error) {
            return error instanceof Error ? error : new Error("NIP46 connection failed");
        }

        const userPubkeyResult = await transport.request("get_public_key", []);
        if (userPubkeyResult instanceof Error) {
            return userPubkeyResult;
        }

        const userPubkey = PublicKey.FromHex(userPubkeyResult);
        if (userPubkey instanceof Error) {
            return userPubkey;
        }

        persistedState = {
            clientSecretKeyHex: localSigner.privateKey.hex,
            remoteSignerPubkey,
            userPubkey: userPubkey.hex,
            relays,
        };

        return new Nip46RemoteSigner(
            userPubkey,
            withSignerRequestErrorHandler(transport.request, options.onSignerRequestError),
        );
    })();

    const close = async () => {
        const closing = transport.close();

        if (connectTimeoutId) {
            clearTimeout(connectTimeoutId);
            connectTimeoutId = undefined;
        }
        rejectConnect?.(new Error("NIP46 session closed"));
        rejectConnect = undefined;

        return closing;
    };

    const nostrConnectUri = buildNostrConnectURI(localSigner.publicKey.hex, {
        relays,
        callback: options.callback,
        appName: options.appName,
        appUrl: options.appUrl,
        appImage: options.appImage,
        perms: options.perms,
        secret,
    });

    return {
        nostrConnectUri,
        signerPromise,
        getPersistedState: () => persistedState,
        logout: (timeoutMs = LOGOUT_TIMEOUT_MS) =>
            logoutAndClose(transport, remoteSignerPubkey !== "", close, timeoutMs),
        close,
    };
}

// Reopens a previously connected session from persisted state. It does not
// wait for the remote signer: the signer is considered connected and the user
// pubkey comes from the saved state (no get_public_key round-trip).
//
// signerPromise only resolves with a Nip46InvalidStateError when the saved
// state itself is invalid. Network/relay failures never fail it: the relays
// keep reconnecting and each request waits for an open relay.
export function restoreNip46Session(
    state: Nip46PersistedSession,
    options?: { onSignerRequestError?: Nip46SignerRequestErrorHandler },
): Nip46RestoredSession {
    const relays = state.relays.length > 0 ? state.relays : DEFAULT_RELAYS;
    const privateKey = PrivateKey.FromHex(state.clientSecretKeyHex);
    const userPubkey = PublicKey.FromHex(state.userPubkey);
    const remoteSignerPubkey = PublicKey.FromHex(state.remoteSignerPubkey);
    const persistedState: Nip46PersistedSession = { ...state, relays };

    const invalidField = privateKey instanceof Error
        ? "client secret key"
        : userPubkey instanceof Error
        ? "user pubkey"
        : remoteSignerPubkey instanceof Error
        ? "remote signer pubkey"
        : undefined;
    if (
        privateKey instanceof Error ||
        userPubkey instanceof Error ||
        remoteSignerPubkey instanceof Error
    ) {
        return {
            signerPromise: Promise.resolve(
                new Nip46InvalidStateError(`Invalid NIP46 persisted state: ${invalidField}`),
            ),
            getPersistedState: () => persistedState,
            logout: async () => {},
            close: async () => {},
        };
    }

    const transport = createNip46Transport({
        localSigner: InMemoryAccountContext.New(privateKey),
        relays,
        getRemoteSignerPubkey: () => remoteSignerPubkey.hex,
        setupErrorMessage: "Failed to restore NIP46 session",
        tolerateRelayFailure: true,
    });

    const signerPromise = (async (): Promise<NostrAccountContext | Error> => {
        const setupResult = await transport.setup;
        if (transport.isClosed()) {
            return new Error("NIP46 session closed");
        }

        // On a setup error the subscription is retried on the next request.
        if (!(setupResult instanceof Error)) {
            transport.consume(setupResult).catch(() => {
                // Stream ended or failed; pending requests will time out on their own.
            });
        }

        return new Nip46RemoteSigner(
            userPubkey,
            withSignerRequestErrorHandler(transport.request, options?.onSignerRequestError),
        );
    })();

    return {
        signerPromise,
        getPersistedState: () => persistedState,
        logout: (timeoutMs = LOGOUT_TIMEOUT_MS) =>
            logoutAndClose(transport, true, transport.close, timeoutMs),
        close: transport.close,
    };
}
