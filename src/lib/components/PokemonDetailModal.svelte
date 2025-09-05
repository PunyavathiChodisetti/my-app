<script lang="ts">
  import { favorites } from "$lib/stores/pokemon";

  export let pokemon: any = null;   // passed from parent
  export let onClose: () => void;   // close function from parent
</script>

{#if pokemon}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg max-w-md w-full relative">
      <button class="absolute top-2 right-2 text-gray-600" on:click={onClose}>✖</button>

      <img src={pokemon.sprites.front_default} alt={pokemon.name} class="mx-auto w-24 h-24" />
      <h2 class="text-center text-xl font-bold capitalize">{pokemon.name}</h2>
      <p class="text-center text-gray-500">ID: {pokemon.id}</p>

      <h3 class="mt-4 font-semibold">Types</h3>
      <div class="flex space-x-2">
        {#each pokemon.types as t}
          <span class="px-2 py-1 text-xs rounded bg-yellow-200">{t.type.name}</span>
        {/each}
      </div>

      <h3 class="mt-4 font-semibold">Abilities</h3>
      <ul class="list-disc list-inside">
        {#each pokemon.abilities as a}
          <li>{a.ability.name}</li>
        {/each}
      </ul>

      <h3 class="mt-4 font-semibold">Stats</h3>
      <ul class="list-disc list-inside mb-10">
        {#each pokemon.stats as s}
          <li>{s.stat.name}: {s.base_stat}</li>
        {/each}
      </ul>

      <!-- Heart Button -->
      <button
        class="absolute bottom-4 right-4 text-2xl"
        on:click={() => favorites.update(f => f.filter(id => id !== pokemon.id))}
      >
        <span class="text-red-500">♥</span>
      </button>
    </div>
  </div>
{/if}
