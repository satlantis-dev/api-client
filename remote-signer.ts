import type { NostrAccountContext, NostrKind, PublicKey, UnsignedNostrEvent } from "@blowater/nostr-sdk";
import type { Client } from "./sdk.ts";

class ApiNostrSigner implements NostrAccountContext {
    constructor(
        public readonly publicKey: PublicKey,
        private readonly apiClient: Client,
    ) {}

    async encrypt(
        pubkey: string,
        plaintext: string,
        algorithm: "nip44" | "nip4",
    ): Promise<string | Error> {
    }

    async decrypt(
        pubkey: string,
        ciphertext: string,
        algorithm?: "nip44" | "nip4",
    ): Promise<string | Error> {
        return new Error("Method not implemented.");
    }

    async signEvent<T extends NostrKind>(event: UnsignedNostrEvent<T>) {
        const res = await this.apiClient.signEvent(event);
        if (res instanceof Error) {
            return res;
        }
        if (res.type == 401) {
            return new Error(res.data);
        }
        return res.data;
    }
}
