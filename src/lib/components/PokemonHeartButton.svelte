<script lang="ts">
  import { favorites } from "$lib/stores/pokemon";

  // Props in runes
  const { pokemonId } = $props<{ pokemonId: number }>();

  // --- Derived state ---
  let isFavorite = $derived($favorites.includes(pokemonId));

  function toggleFavorite() {
    favorites.update((favs) =>
      favs.includes(pokemonId)
        ? favs.filter((id) => id !== pokemonId)
        : [...favs, pokemonId]
    );
  }
</script>

<button class="absolute bottom-2 right-2 text-xl" onclick={toggleFavorite}>
  <span class={isFavorite ? "text-red-500" : "text-gray-400"}>♥</span>
</button>
