<template>
  <div class="theme-switcher">
    <label for="accent-color-picker" class="switcher-label">Accent Color:</label>
    <div class="color-options">
      <button
        v-for="color in availableColors"
        :key="color.name"
        class="color-option"
        :style="{ backgroundColor: color.value }"
        @click="setAccentColor(color.value)"
        :aria-label="`Set accent color to ${color.name}`"
        :class="{ active: currentAccentColor === color.value }"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const availableColors = ref([
  { name: 'Neon Cyan', value: '#00ffff' },
  { name: 'Hot Pink', value: '#ff00ff' },
  { name: 'Electric Green', value: '#39ff14' },
  { name: 'Vibrant Orange', value: '#ffa500' },
]);

const currentAccentColor = ref('');

const setAccentColor = (colorValue) => {
  document.documentElement.style.setProperty('--accent-color-primary', colorValue);
  // Update related glow shadows if they are distinct variables
  // For simplicity, we assume glow shadows derive from --accent-color-primary in CSS
  // e.g. text-shadow: 0 0 5px var(--accent-color-primary), ...

  // For the neural network animation, specifically update its color if it uses a direct prop or separate CSS var
  // This example assumes it inherits via `currentColor` or `var(--accent-color-primary)`

  localStorage.setItem('userAccentColor', colorValue);
  currentAccentColor.value = colorValue;
};

onMounted(() => {
  const savedColor = localStorage.getItem('userAccentColor');
  const defaultColor = availableColors.value[0].value; // Default to Neon Cyan

  if (savedColor && availableColors.value.some(c => c.value === savedColor)) {
    setAccentColor(savedColor);
  } else {
    setAccentColor(defaultColor);
  }
});
</script>

<style scoped>
.theme-switcher {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: rgba(26, 26, 46, 0.7); /* var(--secondary-bg-color) with alpha */
  border-radius: 8px;
  margin-top: 10px; /* Or add to footer */
}

.switcher-label {
  color: var(--text-color-secondary);
  margin-right: 0.75rem;
  font-size: 0.9rem;
}

.color-options {
  display: flex;
  gap: 0.5rem;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #ffffff;
  box-shadow: 0 0 5px #ffffff;
}
</style>
