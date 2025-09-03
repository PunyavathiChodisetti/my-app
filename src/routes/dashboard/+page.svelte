<script lang="ts">
  import { auth, db } from "$lib/firebase";
  import { signOut, updateProfile, onAuthStateChanged } from "firebase/auth";
  import { doc, setDoc, getDoc } from "firebase/firestore";
  import { goto } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";

  let userName = "User";
  let dropdownOpen = false;
  let profilePhoto: string | null = null;
  let loading = true;

  let unsubscribeAuth: (() => void) | null = null;

  // ---- helpers ----
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

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      goto("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  $: firstLetter = userName.charAt(0).toUpperCase();

  // Resize & convert to base64 (keeps Firestore doc under 1MB)
  function fileToBase64Resized(file: File, maxSize = 256): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas context not available"));
          ctx.drawImage(img, 0, 0, w, h);
          // JPEG ~80% to reduce size further
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  // Upload handler: save in Firestore and update auth profile
  async function onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !auth.currentUser) return;

    try {
      const base64 = await fileToBase64Resized(input.files[0]);
      profilePhoto = base64;

      const uid = auth.currentUser.uid;
      const docRef = doc(db, "users", uid);

      // Merge so we don't overwrite other fields later
      await setDoc(docRef, { photoURL: base64 }, { merge: true });

      // Optional: also reflect in Firebase Auth profile
      await updateProfile(auth.currentUser, { photoURL: base64 });

      console.log("Profile photo saved to Firestore & Auth.");
    } catch (err) {
      console.error("Error saving profile photo:", err);
      alert("Could not save profile photo. See console for details.");
    }
  }

  // Listen for auth changes; fetch photo from Firestore when logged in
  onMount(() => {
    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      loading = true;
      try {
        if (user) {
          userName = user.displayName || user.email?.split("@")[0] || "User";

          // Get doc from Firestore
          const docRef = doc(db, "users", user.uid);
          const snap = await getDoc(docRef);

          if (snap.exists() && snap.data()?.photoURL) {
            profilePhoto = snap.data().photoURL as string;
          } else if (user.photoURL) {
            // fallback to auth profile if present
            profilePhoto = user.photoURL;
          } else {
            profilePhoto = null;
          }
        } else {
          // Not logged in
          userName = "User";
          profilePhoto = null;
        }
      } catch (err) {
        console.error("Error loading profile from Firestore:", err);
      } finally {
        loading = false;
      }
    });

    document.addEventListener("click", handleClickOutside);
  });

  onDestroy(() => {
    if (unsubscribeAuth) unsubscribeAuth();
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<!-- Navbar -->
<nav class="flex justify-between items-center px-6 py-3 absolute top-0 left-0 w-full bg-black bg-opacity-40 text-white z-50">
  <h1 class="font-bold text-xl">POKEDEX</h1>

  <div class="flex items-center space-x-4">
    <a href="#" class="hover:text-yellow-300">Pokemons</a>
    <a href="#" class="hover:text-yellow-300">Favourites</a>

    <!-- Profile button with icon or photo -->
    <div class="relative flex items-center space-x-2 cursor-pointer select-none">
      <button
        id="profile-button"
        type="button"
        class="flex items-center space-x-2 hover:text-yellow-300 focus:outline-none"
        on:click={toggleDropdown}
      >
        {#if profilePhoto}
          <img src={profilePhoto} alt="Profile Photo" class="w-8 h-8 rounded-full object-cover" />
        {:else}
          <span class="bg-yellow-400 text-black font-bold rounded-full w-8 h-8 flex items-center justify-center text-lg">
            {firstLetter}
          </span>
        {/if}
        <span>Profile</span>
      </button>

      {#if dropdownOpen}
        <div
          id="profile-dropdown"
          class="absolute right-0 mt-2 w-56 bg-black bg-opacity-90 rounded-md shadow-lg z-50 text-white max-h-96 overflow-auto"
          style="top: 100%;"
        >
          <!-- Username and Email -->
          <div class="px-4 py-3 border-b border-yellow-300 flex flex-col items-start space-y-1">
            <div class="flex items-center space-x-3 w-full">
              {#if profilePhoto}
                <img src={profilePhoto} alt="Profile Photo" class="w-10 h-10 rounded-full object-cover" />
              {:else}
                <span class="bg-yellow-400 text-black font-bold rounded-full w-10 h-10 flex items-center justify-center text-xl">
                  {firstLetter}
                </span>
              {/if}
              <div class="flex flex-col">
                <span class="font-semibold">{userName}</span>
                <span class="text-xs text-yellow-300 truncate max-w-[180px]">{auth.currentUser?.email}</span>
              </div>
            </div>
          </div>

          <!-- Profile photo upload -->
          <label for="photo-upload" class="block cursor-pointer px-4 py-2 hover:bg-yellow-300 hover:text-black text-sm" title="Change profile photo">
            Change Profile Photo
          </label>
          <input id="photo-upload" type="file" accept="image/*" class="hidden" on:change={onPhotoSelected} />

          <!-- Links -->
          <a href="#" class="block px-4 py-2 hover:bg-yellow-300 hover:text-black text-sm">Favourites</a>
          <a href="#" class="block px-4 py-2 hover:bg-yellow-300 hover:text-black text-sm">Settings</a>
          <a href="#" class="block px-4 py-2 hover:bg-yellow-300 hover:text-black text-sm">Help</a>

          <!-- Logout -->
          <button on:click={handleLogout} class="w-full text-left px-4 py-2 hover:bg-yellow-300 hover:text-black rounded-b-md text-sm">
            Logout
          </button>
        </div>
      {/if}
    </div>
  </div>
</nav>

<!-- Background Section -->
<div class="flex items-center justify-center min-h-screen bg-cover bg-center" style="background-image: url('https://wallpapercave.com/wp/wp4058052.png');">
  {#if loading}
    <div class="mt-24 text-white text-sm bg-black/50 px-3 py-1 rounded">Loading profile…</div>
  {/if}
</div>
