<script lang="ts">
  import { auth, googleProvider } from "$lib/firebase";
  import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
  import { goto } from "$app/navigation";

  // --- State runes ---
  let email = $state("");
  let password = $state("");
  let username = $state("");
  let errorMessage = $state("");

  // Derived UI state
  let hasError = $derived(errorMessage !== "");

  // Side-effect: log errors only when they change
  $effect(() => {
    if (errorMessage) {
      console.error("Signup error:", errorMessage);
    }
  });

  // --- Handlers ---
  async function handleSignup(e: Event) {
    e.preventDefault();
    errorMessage = "";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      console.log("Signed up:", userCredential.user);
      goto("/login");
    } catch (error: any) {
      errorMessage = error.message;
    }
  }

  async function handleGoogleSignup() {
    errorMessage = "";
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google signup:", result.user);
      goto("/dashboard");
    } catch (error: any) {
      errorMessage = error.message;
    }
  }
</script>

<!-- Navbar -->
<nav class="flex justify-between items-center px-6 py-3 absolute top-0 left-0 w-full bg-black bg-opacity-40 text-white">
  <h1 class="font-bold text-xl">POKEDEX</h1>
  <div class="space-x-6">
    <a href="/" class="hover:text-yellow-300">Home</a>
    <a href="/login" class="hover:text-yellow-300">Login</a>
  </div>
</nav>

<!-- Background Wrapper -->
<div
  class="flex items-center justify-center min-h-screen bg-cover bg-center"
  style="background-image: url('https://wallpapercave.com/uwp/uwp4775786.jpeg')"
>
  <div class="bg-white/80 rounded-xl p-8 shadow-lg w-full max-w-md">
    <h1 class="text-2xl font-bold text-center mb-6">Create an Account</h1>

    <!-- Signup Form -->
    <form class="space-y-4" onsubmit={handleSignup}>
      <input
        type="text"
        placeholder="Username"
        bind:value={username}
        class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
      />
      <input
        type="email"
        placeholder="Email"
        bind:value={email}
        class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
      />
      <input
        type="password"
        placeholder="Password"
        bind:value={password}
        class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
      />

      <button
        type="submit"
        class="w-full bg-gray-200 hover:bg-gray-300 border rounded-lg py-3 font-medium"
      >
        Sign Up
      </button>
    </form>

    <!-- Divider -->
    <div class="mt-6 text-center text-gray-500 text-sm">or</div>

    <!-- Google Signup Button -->
    <button
      type="button"
      onclick={handleGoogleSignup}
      class="mt-4 w-full bg-red-500 hover:bg-red-600 text-white border rounded-lg py-3 font-medium"
    >
      Sign Up with Google
    </button>

    <!-- Error Message -->
    {#if hasError}
      <p class="mt-4 text-red-500 text-sm text-center">{errorMessage}</p>
    {/if}
  </div>
</div>
