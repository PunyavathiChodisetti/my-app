import { writable } from "svelte/store";

export const favorites = writable<number[]>([]);
export const pokemons = writable<any[]>([]);
