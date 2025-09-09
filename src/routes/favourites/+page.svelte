<script lang="ts">
  import PokemonDetailModal from "$lib/components/PokemonDetailModal.svelte";
  import PokemonHeartButton from "$lib/components/PokemonHeartButton.svelte";
  import { pokemons, favorites, fetchPokemons } from "$lib/stores/pokemon";

  let selectedPokemon = $state<any>(null);

  // --- Derived state ---
  let favPokemons = $derived($pokemons.filter((p) => $favorites.includes(p.id)));
  let loading = $derived($pokemons.length === 0);

  // --- Effects ---
  $effect(async () => {
    if ($pokemons.length === 0) {
      await fetchPokemons();
    }
  });

  // --- UI helpers ---
  function openPokemonDetail(p: any) {
    selectedPokemon = p;
  }
  function closePokemonDetail() {
    selectedPokemon = null;
  }
</script>

<div class="pt-20 px-6 min-h-screen bg-gray-100">
  <h1 class="text-2xl font-bold mb-6">Favourite Pokémon</h1>

  {#if loading}
    <p class="text-gray-500">Loading Pokémon...</p>
  {:else if favPokemons.length === 0}
    <p class="text-gray-500">No favourites yet. Go back and ♥ some Pokémon!</p>
  {:else}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {#each favPokemons as pokemon (pokemon.id)}
        <div class="bg-white p-4 rounded-lg shadow hover:shadow-lg relative">
          <button
            type="button"
            class="cursor-pointer w-full text-left"
            on:click={() => openPokemonDetail(pokemon)}
          >
            <img src={pokemon.sprites.front_default} alt={pokemon.name} class="mx-auto w-20 h-20" />
            <h2 class="text-center font-semibold capitalize">{pokemon.name}</h2>
            <p class="text-center text-sm text-gray-500">#{pokemon.id}</p>
            <div class="flex justify-center space-x-2 mt-2">
              {#each pokemon.types as t}
                <span class="px-2 py-1 text-xs rounded bg-yellow-200">{t.type.name}</span>
              {/each}
            </div>
          </button>
          <PokemonHeartButton pokemonId={pokemon.id} />
        </div>
      {/each}
    </div>
  {/if}
</div>

<PokemonDetailModal pokemon={selectedPokemon} onClose={closePokemonDetail} />
