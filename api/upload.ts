import { handleResponse } from "../helpers/_helper.ts";
import { safeFetch } from "../helpers/safe-fetch.ts";
import type { func_GetJwt } from "../sdk.ts";
import { presign } from "./secure/presign.ts";

export const uploadFileS3 = (url: URL, getJwt: func_GetJwt) =>
async (args: {
    file: File;
    filename: string;
}) => {
    const res = await presign(url, getJwt)({ filename: args.filename });
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
    return handleResponse<{}>(response)
};
