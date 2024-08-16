import { Note } from "../api/note.ts";

import { Account } from "./account.ts";

export type ChatMembership = {
    id: number;
    accountId: number;
    account: Account;
    lastReadNoteId: number;
    noteId: number;
    note: Note;
};

export type Discussion = ChatMembership & {
    lastMessage: Note;
    notSeenCount: number;
};

export type Chat = {
    id?: number;
    about?: string;
    name?: string;
    picture?: string;
    members?: ChatMembership[];
};
