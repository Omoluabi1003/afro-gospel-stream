<template>
  <div id="app-container">
    <header class="app-header">
      <div class="logo">FPWA</div>
      <nav class="main-nav">
        <a href="#" @click.prevent="navigateTo('home')">Home</a>
        <a href="#" @click.prevent="navigateTo('gallery')">Gallery</a>
        <a href="#" @click.prevent="navigateTo('about')">About</a>
        <!-- <a href="#" @click.prevent="navigateTo('contact')">Contact</a> -->
        <button @click="toggleVoiceNav" class="voice-nav-btn" aria-label="Activate Voice Navigation">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.2-9.1c0-.66.54-1.2 1.2-1.2s1.2.54 1.2 1.2v6.2c0 .66-.54 1.2-1.2 1.2s-1.2-.54-1.2-1.2V4.9zm6.7 4.2c-.32 0-.59.2-.7.48-.12.32-.02.68.24.9.49.42 1.08.72 1.76.82V12c0 .55.45 1 1 1s1-.45 1-1v-.6c2.04-.48 3.5-2.25 3.5-4.3C21.5 4.67 19.33 3 17 3c-1.58 0-2.98.78-3.9 2-.17.22-.2.53-.05.78.15.25.46.32.73.15.74-.48 1.64-.73 2.52-.73 1.38 0 2.5 1.12 2.5 2.5 0 1.13-.78 2.08-1.81 2.38zM4.5 7.12C4.5 4.67 6.67 3 9 3c.88 0 1.78.25 2.52.73.27.17.58.1.73-.15.15-.25.12-.56-.05-.78C11.28 1.08 9.88.3 8.3.3 5.17.3 2.5 2.97 2.5 6.1v.5c0 .55.45 1 1 1s1-.45 1-1v-.5c.7-.11 1.28-.42 1.76-.82.26-.22.36-.58.24-.9-.11-.28-.38-.48-.7-.48z"/>
          </svg>
        </button>
      </nav>
    </header>

    <main class="content-area">
      <HomePage v-if="currentPage === 'home'" />
      <!-- <GalleryPage v-if="currentPage === 'gallery'" /> -->
      <!-- <AboutPage v-if="currentPage === 'about'" /> -->
      <!-- <ContactPage v-if="currentPage === 'contact'" /> -->
    </main>

    <footer class="app-footer">
      <ThemeSwitcher />
      <p>&copy; {{ new Date().getFullYear() }} Futuristic PWA. All rights reserved.</p>
    </footer>

    <div v-if="isVoiceListening" class="voice-modal">
      <p>Listening...</p>
      <button @click="stopVoiceNav">Cancel</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import HomePage from './components/HomePage.vue';
import ThemeSwitcher from './components/ThemeSwitcher.vue'; // Import ThemeSwitcher
// Import other pages here when created
// import GalleryPage from './components/GalleryPage.vue';
// import AboutPage from './components/AboutPage.vue';
// import ContactPage from './components/ContactPage.vue';

const currentPage = ref('home'); // Simple router placeholder
const isVoiceListening = ref(false);

const navigateTo = (page) => {
  currentPage.value = page;
};

const toggleVoiceNav = () => {
  if (!isVoiceListening.value) {
    startVoiceNav();
  } else {
    stopVoiceNav();
  }
};

const startVoiceNav = () => {
  // Placeholder for Web Speech API integration
  isVoiceListening.value = true;
  console.log("Voice navigation started (placeholder)");
  // In a real app, initialize SpeechRecognition here
};

const stopVoiceNav = () => {
  isVoiceListening.value = false;
  console.log("Voice navigation stopped (placeholder)");
  // In a real app, stop SpeechRecognition here
};

// Basic voice command handling (conceptual)
// This would be more complex with actual SpeechRecognition
// window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// if (window.SpeechRecognition) {
//   const recognition = new SpeechRecognition();
//   recognition.continuous = false;
//   recognition.lang = 'en-US';
//   recognition.interimResults = false;
//   recognition.maxAlternatives = 1;

//   recognition.onresult = (event) => {
//     const command = event.results[0][0].transcript.toLowerCase().trim();
//     console.log('Voice command:', command);
//     if (command.includes('home')) navigateTo('home');
//     else if (command.includes('gallery')) navigateTo('gallery');
//     else if (command.includes('about')) navigateTo('about');
//     stopVoiceNav();
//   };

//   recognition.onerror = (event) => {
//     console.error('Speech recognition error', event.error);
//     stopVoiceNav();
//   };

//   // Re-assign startVoiceNav to use actual recognition
//   // startVoiceNav = () => { ... recognition.start(); ... }
// } else {
//   console.warn('Speech Recognition API not supported in this browser.');
// }

</script>

<style src="./assets/main.css"></style>
<style scoped>
/* Scoped styles for App.vue can go here if needed */
.voice-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: var(--accent-color-primary); /* Use CSS variable */
  padding: 20px;
  border-radius: 10px;
  border: 1px solid var(--accent-color-primary); /* Use CSS variable */
  z-index: 1000;
  text-align: center;
}

.app-footer { /* Ensure footer items are centered if needed */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px; /* Space between ThemeSwitcher and paragraph */
}
</style>
