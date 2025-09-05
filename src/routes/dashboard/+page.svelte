<script lang="ts">
  import { auth, db } from "$lib/firebase";
  import { signOut, updateProfile, onAuthStateChanged } from "firebase/auth";
  import { doc, getDoc, setDoc } from "firebase/firestore";
  import { goto } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";

  // --- User/Profile state ---
  let userName = "User";
  let dropdownOpen = false;
  let profilePhoto: string | null = null;

  // --- Pokémon state ---
  let pokemons: any[] = [];
  let searchTerm = "";
  let selectedType: string | null = null;
const pokemonTypes = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic",
  "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"
];
  let loading = true;
  let error: string | null = null;
  let selectedPokemon: any = null;
  let favorites: number[] = []; // store Pokémon IDs

  // --- Navbar/Profile setup ---
  async function loadUserProfile(user: any) {
    if (!user) return;
    userName = user.displayName || user.email?.split("@")[0] || "User";

    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.profilePhoto) profilePhoto = data.profilePhoto;
      } else if (user.photoURL) {
        profilePhoto = user.photoURL;
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    }
  }

  onMount(() => {
  if (typeof window !== "undefined") {
    // Listen for Firebase login state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadUserProfile(user);
      }
    });

    document.addEventListener("click", handleClickOutside);
    fetchPokemons();

    // cleanup on destroy
    return () => {
      unsubscribe();
      document.removeEventListener("click", handleClickOutside);
    };
  }
});

  onDestroy(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  async function handleLogout() {
    try {
      await signOut(auth);
      goto("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  function handleClickOutside(event: MouseEvent) {
    const dropdown = document.getElementById("profile-dropdown");
    const button = document.getElementById("profile-button");
    if (
      dropdown &&
      button &&
      !dropdown.contains(event.target as Node) &&
      !button.contains(event.target as Node)
    ) {
      dropdownOpen = false;
    }
  }

  // Fallback first letter
  $: firstLetter = userName.charAt(0).toUpperCase();

  // --- Profile Photo Upload ---
  async function onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        profilePhoto = e.target?.result as string;

        const user = auth.currentUser;
        if (user) {
          try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, { profilePhoto }, { merge: true });
            await updateProfile(user, { photoURL: profilePhoto });
          } catch (err) {
            console.error("Error saving profile photo:", err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // --- Fetch Pokémon list ---
  async function fetchPokemons() {
    loading = true;
    error = null;
    try {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
      if (!res.ok) throw new Error("Failed to fetch Pokémon list");
      const data = await res.json();

      const detailed = await Promise.all(
        data.results.map(async (p: any) => {
          const r = await fetch(p.url);
          return await r.json();
        })
      );
      pokemons = detailed;
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  // --- Filter by search ---
  $: filteredPokemons = pokemons.filter((p) => {
  const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesType = selectedType
    ? p.types.some((t: any) => t.type.name === selectedType)
    : true;
  return matchesName && matchesType;
});


  // --- Open detail modal ---
  function openPokemonDetail(p: any) {
    selectedPokemon = p;
  }
  function closePokemonDetail() {
    selectedPokemon = null;
  }

  // --- Toggle favorites ---
  function toggleFavorite(pokemonId: number) {
    if (favorites.includes(pokemonId)) {
      favorites = favorites.filter((id) => id !== pokemonId);
    } else {
      favorites = [...favorites, pokemonId];
    }
  }
</script>

<!-- Navbar -->
<nav class="flex justify-between items-center px-6 py-3 fixed top-0 left-0 w-full bg-black bg-opacity-80 text-white z-50">
  <h1 class="font-bold text-xl">POKEDEX</h1>

  <div class="flex items-center space-x-4">
    <a href="#" class="hover:text-yellow-300">Pokemons</a>

    <!-- Profile -->
    <div class="relative flex items-center space-x-2 cursor-pointer select-none">
      <button
        id="profile-button"
        class="flex items-center space-x-2 hover:text-yellow-300"
        on:click={toggleDropdown}
      >
        {#if profilePhoto}
          <img src={profilePhoto} alt="Profile" class="w-8 h-8 rounded-full object-cover" />
        {:else}
          <span class="bg-yellow-400 text-black font-bold rounded-full w-8 h-8 flex items-center justify-center">
            {firstLetter}
          </span>
        {/if}
        <span>Profile</span>
      </button>

      {#if dropdownOpen}
        <div
          id="profile-dropdown"
          class="absolute right-0 mt-2 w-64 bg-white text-black rounded-md shadow-lg z-50"
          style="top: 100%;"
        >
          <!-- User info -->
          <div class="px-4 py-3 border-b border-yellow-400 flex items-center space-x-3">
            {#if profilePhoto}
              <img src={profilePhoto} alt="Profile" class="w-10 h-10 rounded-full object-cover" />
            {:else}
              <span class="bg-yellow-400 text-black font-bold rounded-full w-10 h-10 flex items-center justify-center text-xl">
                {firstLetter}
              </span>
            {/if}
            <div>
              <p class="font-bold">{userName}</p>
              <p class="text-sm text-black-400">{auth.currentUser?.email}</p>
            </div>
          </div>

          <!-- Upload -->
          <label for="photo-upload" class="block px-4 py-2 cursor-pointer hover:bg-gray-200 hover:text-black text-sm">
            Change Profile Photo
          </label>
          <input id="photo-upload" type="file" accept="image/*" class="hidden" on:change={onPhotoSelected} />

          <!-- Menu links -->
          <ul class="py-2 text-sm">
            <li><a href="#" class="block px-4 py-2 hover:bg-gray-200 hover:text-black">Favourites</a></li>
            <li><a href="#" class="block px-4 py-2 hover:bg-gray-200 hover:text-black">Settings</a></li>
            
          </ul>

          <!-- Logout -->
          <div class="px-4 py-3">
            <button
              on:click={handleLogout}
              class="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</nav>

<!-- Dashboard -->
<div class="pt-20 px-6 min-h-screen bg-gray-100">
  <!-- Search + Filter -->
<div class="flex justify-between items-center mb-6">
  <!-- Search -->
  <input
    type="text"
    placeholder="Search Pokémon..."
    bind:value={searchTerm}
    class="w-full md:w-1/3 px-4 py-2 border rounded-md"
  />

  <!-- Filter Dropdown -->
  <div class="ml-4 w-full md:w-1/3">
    <select
      bind:value={selectedType}
      class="w-full px-4 py-2 border rounded-md text-gray-700"
    >
      <option value={null} disabled selected>Filter by type</option>
      {#each pokemonTypes as type}
        <option value={type} class="capitalize">{type}</option>
      {/each}
    </select>
  </div>
</div>


  {#if loading}
    <p>Loading Pokémon...</p>
  {:else if error}
    <p class="text-red-500">{error}</p>
  {:else}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {#each filteredPokemons as pokemon}
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
            on:click={() => toggleFavorite(pokemon.id)}
          >
            <span class={favorites.includes(pokemon.id) ? "text-red-500" : "text-gray-400"}>♥</span>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Detail Modal -->
{#if selectedPokemon}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg max-w-md w-full relative">
      <button class="absolute top-2 right-2 text-gray-600" on:click={closePokemonDetail}>✖</button>
      <img src={selectedPokemon.sprites.front_default} alt={selectedPokemon.name} class="mx-auto w-24 h-24" />
      <h2 class="text-center text-xl font-bold capitalize">{selectedPokemon.name}</h2>
      <p class="text-center text-gray-500">ID: {selectedPokemon.id}</p>

      <h3 class="mt-4 font-semibold">Types</h3>
      <div class="flex space-x-2">
        {#each selectedPokemon.types as t}
          <span class="px-2 py-1 text-xs rounded bg-yellow-200">{t.type.name}</span>
        {/each}
      </div>

      <h3 class="mt-4 font-semibold">Abilities</h3>
      <ul class="list-disc list-inside">
        {#each selectedPokemon.abilities as a}
          <li>{a.ability.name}</li>
        {/each}
      </ul>

      <h3 class="mt-4 font-semibold">Stats</h3>
      <ul class="list-disc list-inside mb-10">
        {#each selectedPokemon.stats as s}
          <li>{s.stat.name}: {s.base_stat}</li>
        {/each}
      </ul>

      <!-- Heart Button (bottom-right inside modal) -->
      <button
        class="absolute bottom-4 right-4 text-2xl"
        on:click={() => toggleFavorite(selectedPokemon.id)}
      >
        <span class={favorites.includes(selectedPokemon.id) ? "text-red-500" : "text-gray-400"}>♥</span>
      </button>
    </div>
  </div>
{/if}

