<script lang="ts">
  import { auth, db } from "$lib/firebase";
  import { signOut, updateProfile, onAuthStateChanged } from "firebase/auth";
  import { doc, getDoc, setDoc } from "firebase/firestore";
  import { beforeNavigate, goto } from "$app/navigation";
  import PokemonHeartButton from "$lib/components/PokemonHeartButton.svelte";
  import PokemonDetailModal from "$lib/components/PokemonDetailModal.svelte";
  import { pokemons, fetchPokemons } from "$lib/stores/pokemon";

  // --- Local rune state ---
  let userName = $state("User");
  let dropdownOpen = $state(false);
  let profilePhoto = $state<string | null>(null);

  let searchTerm = $state("");
  let selectedType = $state<string | null>(null);
  let selectedPokemon = $state<any>(null);
  let error = $state<string | null>(null);

  // --- Derived state ---
  let loading = $derived($pokemons.length === 0);
  let firstLetter = $derived(userName.charAt(0).toUpperCase());

  let filteredPokemons = $derived(
    $pokemons.filter((p) => {
      const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType
        ? p.types.some((t: any) => t.type.name === selectedType)
        : true;
      return matchesName && matchesType;
    })
  );

  const pokemonTypes = [
    "normal","fire","water","electric","grass","ice","fighting","poison","ground",
    "flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"
  ];

  // --- Effects ---
  $effect(() => {
    if ($pokemons.length === 0) fetchPokemons();
  });

  $effect(() => {
    // Auth listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) loadUserProfile(user);
    });
    return () => unsubscribe();
  });

  $effect(() => {
    // Outside click handler
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
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  });

  $effect(() => {
    // Back navigation handling
    beforeNavigate((nav) => {
      if (nav.type !== "popstate") return;
      if (selectedPokemon) {
        closePokemonDetail();
        nav.cancel();
      } else if (searchTerm.trim() !== "") {
        searchTerm = "";
        nav.cancel();
      } else if (selectedType) {
        selectedType = null;
        nav.cancel();
      }else{
        nav.cancel();
      }
    });
  });

  // --- User/Profile helpers ---
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

  function openPokemonDetail(p: any) { selectedPokemon = p; }
  function closePokemonDetail() { selectedPokemon = null; }
</script>

<!-- Navbar -->
<nav class="flex justify-between items-center px-6 py-3 fixed top-0 left-0 w-full bg-black bg-opacity-80 text-white z-50">
  <h1 class="font-bold text-xl">POKEDEX</h1>

  <div class="flex items-center space-x-4">
    <div class="relative flex items-center space-x-2">
      <button id="profile-button" class="flex items-center space-x-2 hover:text-yellow-300" onclick={toggleDropdown}>
        {#if profilePhoto}
          <img src={profilePhoto} alt="Profile" class="w-8 h-8 rounded-full object-cover" />
        {:else}
          <span class="bg-yellow-400 text-black font-bold rounded-full w-8 h-8 flex items-center justify-center">{firstLetter}</span>
        {/if}
        <span>Profile</span>
      </button>

      {#if dropdownOpen}
        <div id="profile-dropdown" class="absolute top-full right-0 mt-2 w-64 bg-white text-black rounded-md shadow-lg z-[1000]">
          <div class="px-4 py-3 border-b border-yellow-400 flex items-center space-x-3">
            {#if profilePhoto}
              <img src={profilePhoto} alt="Profile" class="w-10 h-10 rounded-full object-cover" />
            {:else}
              <span class="bg-yellow-400 text-black font-bold rounded-full w-10 h-10 flex items-center justify-center text-xl">{firstLetter}</span>
            {/if}
            <div>
              <p class="font-bold">{userName}</p>
              <button type="button" class="text-sm text-gray-500 hover:text-blue-800"
                onclick={() => navigator.clipboard.writeText(auth.currentUser?.email || "")}>
                {auth.currentUser?.email}
              </button>
            </div>
          </div>

          <label for="photo-upload" class="block px-4 py-2 cursor-pointer hover:bg-gray-200 text-sm">Change Profile Photo</label>
          <input id="photo-upload" type="file" accept="image/*" class="hidden" onchange={onPhotoSelected} />

          <ul class="py-2 text-sm">
            <li><a href="/favourites" class="block px-4 py-2 hover:bg-gray-200">Favourites</a></li>
          </ul>

          <div class="px-4 py-3">
            <button onclick={handleLogout} class="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold">Logout</button>
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
      {#each filteredPokemons as pokemon (pokemon.id)}
        <div class="bg-white p-4 rounded-lg shadow hover:shadow-lg relative">
          <button type="button" onclick={() => openPokemonDetail(pokemon)} class="w-full text-left cursor-pointer">
            <img src={pokemon.sprites.front_default} alt={pokemon.name} class="mx-auto w-20 h-20" />
            <h2 class="text-center font-semibold capitalize">{pokemon.name}</h2>
            <p class="text-center text-sm text-gray-500">#{pokemon.id}</p>
            <div class="flex justify-center space-x-2 mt-2">
              {#each pokemon.types as t}
                <span class="px-2 py-1 text-xs rounded bg-yellow-200">{t.type.name}</span>
              {/each}
            </div>
          </button>
          <!-- Heart button -->
          <PokemonHeartButton pokemonId={pokemon.id} />
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Pokémon detail modal -->
<PokemonDetailModal pokemon={selectedPokemon} onClose={closePokemonDetail} />
