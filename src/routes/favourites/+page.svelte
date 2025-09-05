<script lang="ts">
  import { favorites, pokemons } from "$lib/stores/pokemon";
  import { beforeNavigate } from "$app/navigation";
  import PokemonDetailModal from "$lib/components/PokemonDetailModal.svelte";
  import PokemonHeartButton from "$lib/components/PokemonHeartButton.svelte";

  let favPokemons: any[] = [];
  let selectedPokemon: any = null;

  beforeNavigate((nav) => {
    if (nav.type === "popstate" && selectedPokemon) {
      // Close modal instead of navigating back
      closePokemonDetail();
      nav.cancel();
    }
  });

  // Filter only favorite Pokémon
  $: favPokemons = $pokemons.filter((p) => $favorites.includes(p.id));

  function openPokemonDetail(p: any) { selectedPokemon = p; }
  function closePokemonDetail() { selectedPokemon = null; }
</script>

<div class="pt-20 px-6 min-h-screen bg-gray-100">
  <h1 class="text-2xl font-bold mb-6">Favourite Pokémon</h1>

  {#if favPokemons.length === 0}
    <p class="text-gray-500">No favourites yet. Go back and ♥ some Pokémon!</p>
  {:else}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {#each favPokemons as pokemon}
        <div class="bg-white p-4 rounded-lg shadow hover:shadow-lg relative">
          <!-- open detail modal -->
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
          <!--Heart Button -->
          <PokemonHeartButton pokemonId={pokemon.id} />
        </div>
      {/each}
    </div>
  {/if}
</div>
<!-- shared modal -->
<PokemonDetailModal pokemon={selectedPokemon} onClose={closePokemonDetail} />
