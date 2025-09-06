import { writable } from "svelte/store";

// Load favorites from localStorage if exists
const storedFavs = typeof localStorage !== "undefined" ? JSON.parse(localStorage.getItem("favorites") || "[]") : [];

export const pokemons = writable([]);
export const favorites = writable<number[]>(storedFavs);

// Subscribe to save changes to localStorage
favorites.subscribe((value) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("favorites", JSON.stringify(value));
  }
});
