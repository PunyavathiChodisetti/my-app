<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  // This assumes `favorites` and `pokemons` exist globally (in a store).
  // So we need to move them into a Svelte store.
  import { favorites, pokemons } from "$lib/stores/pokemon";

  let favPokemons: any[] = [];

  // Load only favorites
  $: favPokemons = $pokemons.filter((p) => $favorites.includes(p.id));

  function openPokemonDetail(p: any) {
    goto(`/pokemon/${p.id}`); // optional detail page if you add one
  }
</script>

<div class="pt-20 px-6 min-h-screen bg-gray-100">
  <h1 class="text-2xl font-bold mb-6">Favourite Pokémon</h1>

  {#if favPokemons.length === 0}
    <p class="text-gray-500">No favourites yet. Go back and ♥ some Pokémon!</p>
  {:else}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {#each favPokemons as pokemon}
        <div class="bg-white p-4 rounded-lg shadow hover:shadow-lg relative">
          <div on:click={() => openPokemonDetail(pokemon)} class="cursor-pointer">
            <img src={pokemon.sprites.front_default} alt={pokemon.name} class="mx-auto w-20 h-20" />
            <h2 class="text-center font-semibold capitalize">{pokemon.name}</h2>
            <p class="text-center text-sm text-gray-500">#{pokemon.id}</p>
            <div class="flex justify-center space-x-2 mt-2">
              {#each pokemon.types as t}
                <span class="px-2 py-1 text-xs rounded bg-yellow-200">{t.type.name}</span>
              {/each}
            </div>
          </div>
          <!-- Heart Button -->
          <button
            class="absolute bottom-2 right-2 text-xl"
            on:click={() => favorites.update(f => f.filter(id => id !== pokemon.id))}
          >
            <span class="text-red-500">♥</span>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
