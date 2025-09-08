<!-- Home.svelte -->

<!-- Navbar -->
<nav class="flex justify-between items-center px-6 py-3 absolute top-0 left-0 w-full bg-black bg-opacity-40 text-white">
  <h1 class="font-bold text-xl">POKEDEX</h1>
  <div class="space-x-6">
    <a href="/login" class="hover:text-yellow-300">Login</a>
    <a href="/signup" class="hover:text-yellow-300">Sign Up</a>
  </div>
</nav>

<!-- Background with Welcome Text -->
<div
  class="flex justify-center items-start h-screen bg-cover bg-center pt-24"
  style="background-image: url('https://premiumteamnames.com/wp-content/uploads/2024/11/pokemon-team-names.webp');"
>
  <h2 class="text-5xl font-extrabold text-yellow-300 drop-shadow-2xl">
    Welcome to Pokémon World!
  </h2>
</div>