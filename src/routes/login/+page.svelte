<script lang="ts">
  import { auth } from "$lib/firebase";
  import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";
  import { goto } from "$app/navigation";

  let email = "";
  let password = "";
  let errorMessage = "";
  let successMessage = "";

  // Email + Password Login
  async function handleLogin(e: Event) {
    e.preventDefault();
    errorMessage = "";
    successMessage = "";

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in:", userCredential.user);
      goto("/dashboard"); // redirect after login
    } catch (error: any) {
      errorMessage = error.message;
      console.error("Login error:", error);
    }
  }

  // Google Login
  async function handleGoogleLogin() {
    errorMessage = "";
    successMessage = "";
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Google Logged in:", result.user);
      goto("/dashboard"); // redirect after Google login
    } catch (error: any) {
      errorMessage = error.message;
      console.error("Google login error:", error);
    }
  }

  // Forgot Password
  async function handleForgotPassword() {
    errorMessage = "";
    successMessage = "";
    if (!email) {
      errorMessage = "Please enter your email first";
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      successMessage = "Password reset email sent! Check your inbox.";
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
    <a href="#" class="hover:text-yellow-300">Pokemons</a>
    <a href="#" class="hover:text-yellow-300">Favourites</a>
  </div>
</nav>

<!-- Login Section with Pokémon background -->
<div
  class="flex justify-center items-center h-screen bg-cover bg-center"
  style="background-image: url('https://wallpapercave.com/uwp/uwp4775786.jpeg');"
>
  <div class="bg-white bg-opacity-95 border rounded-2xl shadow-xl p-8 w-96 text-center mt-20">
    <!-- Pokéball Icon -->
    <div class="flex justify-center mb-4">
      <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
        alt="Pokeball"
        class="w-10 h-10"
      />
    </div>

    <h2 class="text-2xl font-bold text-gray-800 mb-6">Login</h2>

    <!-- Login Form -->
    <form class="space-y-4" on:submit|preventDefault={handleLogin}>
      <input
        type="email"
        bind:value={email}
        placeholder="Email"
        class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
        required
      />
      <input
        type="password"
        bind:value={password}
        placeholder="Password"
        class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
        required
      />
      <button
        type="submit"
        class="w-full bg-gray-200 hover:bg-gray-300 border rounded-lg py-3 font-medium"
      >
        Login
      </button>
    </form>

    <!-- Google Login -->
    <button
      on:click={handleGoogleLogin}
      class="w-full mt-4 bg-red-500 hover:bg-red-600 text-white rounded-lg py-3 font-medium"
    >
      Login with Google
    </button>

    <!-- Forgot Password -->
    <button
      on:click={handleForgotPassword}
      class="mt-2 text-sm text-blue-600 hover:underline"
    >
      Forgot Password?
    </button>

    <!-- Error & Success Messages -->
    {#if errorMessage}
      <p class="mt-4 text-red-500 text-sm">{errorMessage}</p>
    {/if}
    {#if successMessage}
      <p class="mt-4 text-green-500 text-sm">{successMessage}</p>
    {/if}

    <!-- Signup Link -->
    <p class="mt-6 text-sm text-gray-700">
      Don’t have an account?
      <a href="/signup" class="text-red-500 hover:underline font-medium">Sign up</a>
    </p>
  </div>
</div>