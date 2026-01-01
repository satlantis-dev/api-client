import { safeFetch } from "../helpers/safe-fetch.ts";
import { createPublicUrl, createSecureUrl, handleResponse } from "../helpers/util.ts";
import type { Persona } from "../models/persona.ts";
import type { func_GetJwt } from "../sdk.ts";

export function getPersonas(urlArg: URL) {
    return async () => {
        const url = createPublicUrl(urlArg, "/personas");

        const response = await safeFetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response instanceof Error) {
            return response;
        }

        return handleResponse<Persona[]>(response);
    };
}

export type UpdateUserPersonasArgs = {
    personaIds: number[];
};

export function updateUserPersonas(urlArg: URL, getJwt: func_GetJwt) {
    return async (args: UpdateUserPersonasArgs) => {
        const url = createSecureUrl(urlArg, "/user/personas");

        const jwtToken = getJwt();
        const headers = new Headers();

        if (!jwtToken) {
            return new Error("jwt token is empty");
        }

        headers.set("Authorization", `Bearer ${jwtToken}`);

        const response = await safeFetch(url, {
            method: "PUT",
            headers,
            body: JSON.stringify(args),
        });

        if (response instanceof Error) {
            return response;
        }

        return handleResponse<void>(response);
    };
}
