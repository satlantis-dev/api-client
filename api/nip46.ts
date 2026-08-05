import {
    ConnectionPool,
    InMemoryAccountContext,
    type NostrAccountContext,
    type NostrEvent,
    NostrKind,
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

export type Nip46Options = {
    relays: string[];
    callback?: string;
    appName?: string;
    appUrl?: string;
    appImage?: string;
    perms?: string[];
    connectTimeoutMs?: number;
};

export type Nip46Session = {
    nostrConnectUri: string;
    signerPromise: Promise<NostrAccountContext | Error>;
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

export function createNip46Session(options: Nip46Options): Nip46Session {
    const localSigner = InMemoryAccountContext.Generate();
    const secret = randomString(12);
    const relays = options.relays.length > 0 ? options.relays : ["wss://nrs.primal.net"];

    const pool = new ConnectionPool({ signer: localSigner });
    const pendingRequests = new Map<string, PendingRequest>();

    let closed = false;
    let remoteSignerPubkey = "";
    let resolveSetup!: () => void;
    const setupDone = new Promise<void>((resolve) => {
        resolveSetup = resolve;
    });
    let connectTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let rejectConnect: ((error: Error) => void) | undefined;
    let closePromise: Promise<void> | undefined;

    const signerPromise = (async (): Promise<NostrAccountContext | Error> => {
        const setupResult = await (async () => {
            try {
                // Register the subscription before connecting relays. ConnectionPool
                // can then finish wiring it synchronously during addRelayURLs, which
                // avoids a close/newSub race when the user switches login methods.
                const subId = `nip46-${randomString(8)}`;
                const stream = await pool.newSub(subId, {
                    kinds: [NIP46_KIND],
                    "#p": [localSigner.publicKey.hex],
                    limit: 100,
                });
                if (stream instanceof Error) {
                    return stream;
                }

                const relayErrors = await pool.addRelayURLs(relays);
                if (relayErrors && relayErrors.length === relays.length) {
                    return relayErrors[0];
                }

                return stream;
            } catch (error) {
                return error instanceof Error ? error : new Error("Failed to start NIP46 session");
            } finally {
                resolveSetup();
            }
        })();

        if (setupResult instanceof Error) {
            return setupResult;
        }
        if (closed) {
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

            (async () => {
                for await (const msg of stream.chan) {
                    if (closed) {
                        break;
                    }

                    if (msg.res.type !== "EVENT") {
                        continue;
                    }

                    const event = msg.res.event;
                    if (
                        remoteSignerPubkey !== "" &&
                        event.pubkey !== remoteSignerPubkey
                    ) {
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

                    if (payload.result === secret && remoteSignerPubkey === "") {
                        remoteSignerPubkey = event.pubkey;
                        if (connectTimeoutId) {
                            clearTimeout(connectTimeoutId);
                            connectTimeoutId = undefined;
                        }
                        rejectConnect = undefined;
                        resolve();
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
            })().catch((error) => {
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

        const request = async (
            method: string,
            params: string[],
        ): Promise<string | Error> => {
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

            const responsePromise = new Promise<string>((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    pendingRequests.delete(id);
                    reject(new Error(`NIP46 request timed out: ${method}`));
                }, 45_000);

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

        const userPubkeyResult = await request("get_public_key", []);
        if (userPubkeyResult instanceof Error) {
            return userPubkeyResult;
        }

        const userPubkey = PublicKey.FromHex(userPubkeyResult);
        if (userPubkey instanceof Error) {
            return userPubkey;
        }

        return new Nip46RemoteSigner(userPubkey, request);
    })();

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
        close: async () => {
            if (closePromise) {
                return closePromise;
            }
            closed = true;

            if (connectTimeoutId) {
                clearTimeout(connectTimeoutId);
                connectTimeoutId = undefined;
            }
            rejectConnect?.(new Error("NIP46 session closed"));
            rejectConnect = undefined;

            for (const pending of pendingRequests.values()) {
                clearTimeout(pending.timeoutId);
                pending.reject(new Error("NIP46 session closed"));
            }
            pendingRequests.clear();

            closePromise = (async () => {
                await setupDone;
                await pool.close();
            })();
            return closePromise;
        },
    };
}
