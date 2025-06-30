import { writable, type Writable } from "svelte/store";

export const auth:Writable<boolean> = writable(false);

export const authUrl = "http://localhost:3001/auth/login"

export const serverUrl = "http://localhost:3001";


export const Token:Writable<string> = writable("");

export const user:Writable<any> = writable({});