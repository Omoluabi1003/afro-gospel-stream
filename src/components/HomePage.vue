<template>
  <div class="homepage">
    <section class="hero-section">
      <NeuralNetworkAnimation />
      <h1 class="main-title">Experience Tomorrow, Today.</h1>
      <p class="subtitle">Step into a new dimension of web interaction.</p>
      <a href="#" @click.prevent="exploreMore" class="cta-button">Explore Features</a>
    </section>

    <section class="intro-section">
      <h2>The Future. Unveiled.</h2>
      <p>
        This platform showcases cutting-edge design and interactive elements,
        pushing the boundaries of what's possible on the web. Built as a
        Progressive Web App, it's installable on any device for a seamless,
        futuristic experience.
      </p>
    </section>
     <!-- More sections can be added here -->
  </div>
</template>

<script setup>
import NeuralNetworkAnimation from './NeuralNetworkAnimation.vue';

const exploreMore = () => {
  // Placeholder for navigation or scrolling to features
  console.log("Explore More clicked");
  // Example: document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
};
</script>

<style scoped>
.homepage {
  color: #e0e0e0; /* Light grey text for readability on dark background */
  padding-top: 0; /* Remove padding if NeuralNetworkAnimation is full-bleed */
}

.hero-section {
  min-height: 100vh; /* Full viewport height */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative; /* For positioning the animation */
  padding: 2rem;
  overflow: hidden; /* Ensures animation doesn't cause scrollbars if it's expansive */
}

.main-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-top: 1rem; /* Adjusted margin if animation is above */
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
  animation: fadeInGlow 2s ease-in-out 1s forwards; /* Animation after neural net */
  opacity: 0;
  text-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff; /* Neon Cyan glow */
}

.subtitle {
  font-size: 1.5rem;
  color: #cccccc; /* Slightly dimmer than title */
  margin-bottom: 2rem;
  animation: fadeIn 2s ease-in-out 1.5s forwards;
  opacity: 0;
}

.cta-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  color: #000000; /* Black text */
  background: #00ffff; /* Neon Cyan background */
  border: none;
  border-radius: 50px; /* Pill shape */
  text-decoration: none;
  font-weight: bold;
  letter-spacing: 1px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fadeIn 2s ease-in-out 2s forwards;
  opacity: 0;
  box-shadow: 0 0 8px #00ffff, 0 0 12px #00ffff, 0 0 16px #00ffff;
}

.cta-button:hover, .cta-button:focus {
  transform: scale(1.05);
  box-shadow: 0 0 12px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff; /* Intensified glow */
}

.intro-section {
  padding: 4rem 2rem;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.intro-section h2 {
  font-size: 2.5rem;
  color: #ffffff;
  margin-bottom: 1rem;
  text-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff; /* Neon Pink glow for contrast */
}

/* Keyframe animations */
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes fadeInGlow {
  to {
    opacity: 1;
    text-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff, 0 0 20px #00ffff;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }
  .subtitle {
    font-size: 1.2rem;
  }
  .intro-section h2 {
    font-size: 2rem;
  }
}
</style>
