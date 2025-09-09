import { writable } from "svelte/store";
import { GraphQLClient, gql } from "graphql-request";

// --- LocalStorage: favorites ---
const storedFavs =
  typeof localStorage !== "undefined"
    ? JSON.parse(localStorage.getItem("favorites") || "[]")
    : [];

export const pokemons = writable<any[]>([]);
export const favorites = writable<number[]>(storedFavs);

// Persist favorites to localStorage
favorites.subscribe((value) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("favorites", JSON.stringify(value));
  }
});

// --- GraphQL setup ---
const client = new GraphQLClient("https://beta.pokeapi.co/graphql/v1beta");

const GET_POKEMONS = gql`
  query GetPokemons($limit: Int!, $offset: Int!) {
    pokemon_v2_pokemon(limit: $limit, offset: $offset) {
      id
      name
      height
      weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonabilities { pokemon_v2_ability { name } }
      pokemon_v2_pokemonstats { base_stat pokemon_v2_stat { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
`;

export async function fetchPokemons(limit = 200, offset = 0) {
  const result: any = await client.request(GET_POKEMONS, { limit, offset });
  if (!result?.pokemon_v2_pokemon) throw new Error("No data from GraphQL");

  const mapped = result.pokemon_v2_pokemon.map((p: any) => {
    let spriteObj: any = {};
    if (p.pokemon_v2_pokemonsprites?.length > 0 && p.pokemon_v2_pokemonsprites[0].sprites) {
      try {
        spriteObj = JSON.parse(p.pokemon_v2_pokemonsprites[0].sprites);
      } catch { spriteObj = {}; }
    }
    const frontImage =
      spriteObj?.front_default ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;

    return {
      id: p.id,
      name: p.name,
      sprites: { front_default: frontImage },
      types: p.pokemon_v2_pokemontypes.map((t: any) => ({ type: { name: t.pokemon_v2_type.name } })),
      abilities: p.pokemon_v2_pokemonabilities.map((a: any) => ({ ability: { name: a.pokemon_v2_ability.name } })),
      stats: p.pokemon_v2_pokemonstats.map((s: any) => ({ base_stat: s.base_stat, stat: { name: s.pokemon_v2_stat.name } })),
      height: p.height,
      weight: p.weight,
    };
  });

  pokemons.set(mapped);
}