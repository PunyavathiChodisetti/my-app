<script lang="ts">
  import { auth } from "$lib/firebase";
  import { signOut } from "firebase/auth";
  import { goto } from "$app/navigation";

  async function handleLogout() {
    try {
      await signOut(auth);
      console.log("✅ Logged out");
      goto("/"); // redirect to home page after logout
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  }
</script>

<!-- Navbar -->
<nav class="flex justify-between items-center px-6 py-3 absolute top-0 left-0 w-full bg-black bg-opacity-40 text-white">
  <h1 class="font-bold text-xl">POKEDEX</h1>
  <a href="#" class="hover:text-yellow-300">Pokemons</a>
    <a href="#" class="hover:text-yellow-300">Favourites</a>
  <div class="space-x-6">
    
    <!-- Changed <a> to button so logout actually works -->
    <button
      type="button"
      on:click={handleLogout}
      class="hover:text-yellow-300"
    >
      Logout
    </button>
  </div>
</nav>

<!-- Background Section -->
<div
  class="flex items-center justify-center min-h-screen bg-cover bg-center"
  style="background-image: url('https://wallpapercave.com/wp/wp4058052.png');"
>
</div>
