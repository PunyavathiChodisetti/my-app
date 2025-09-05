<script lang="ts">
  import { favorites } from "$lib/stores/pokemon";

  export let pokemonId: number;

  // Toggle function for favourites
  function toggleFavorite() {
    favorites.update((favs) =>
      favs.includes(pokemonId)
        ? favs.filter((id) => id !== pokemonId)
        : [...favs, pokemonId]
    );
  }
</script>

<button
  class="absolute bottom-2 right-2 text-xl"
  on:click={toggleFavorite}
>
  <span class={$favorites.includes(pokemonId) ? "text-red-500" : "text-gray-400"}>♥</span>
</button>
