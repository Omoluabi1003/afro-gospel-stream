import { createApp } from 'vue'
import App from './App.vue'
import './assets/base.css' // Global base styles

const app = createApp(App)

// Register PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js') // Path relative to the root
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

app.mount('#app')
