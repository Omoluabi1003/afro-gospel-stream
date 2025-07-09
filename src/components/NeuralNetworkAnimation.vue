<template>
  <div class="neural-network-container">
    <div class="node-grid">
      <div v-for="n in 70" :key="`node-${n}`" class="node" :style="getNodeStyle()"></div>
    </div>
    <div class="connection-lines">
      <!-- Lines would ideally be drawn with SVG/Canvas or WebGL for true connections -->
      <!-- This is a conceptual CSS representation -->
      <div v-for="l in 10" :key="`line-${l}`" class="line" :style="getLineStyle()"></div>
    </div>
    <p class="animation-text">Initializing Neural Matrix...</p>
  </div>
</template>

<script setup>
// Full Three.js/GSAP integration for a dynamic 3D version would replace this.

const getNodeStyle = () => {
  return {
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${2 + Math.random() * 3}s`,
  };
};

const getLineStyle = () => {
  // Simple random lines for placeholder effect
  const style = {
    top: `${Math.random() * 80 + 10}%`, // Avoid edges
    left: `${Math.random() * 80 + 10}%`,
    width: `${50 + Math.random() * 100}px`,
    transform: `rotate(${Math.random() * 360}deg)`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${3 + Math.random() * 3}s`,
  };
  if (Math.random() > 0.5) {
    style.height = '2px'; // Horizontal-ish
  } else {
    style.width = '2px'; // Vertical-ish
    style.height = `${50 + Math.random() * 100}px`;
  }
  return style;
};
</script>

<style scoped>
.neural-network-container {
  width: 100%;
  height: 350px; /* Increased height */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative; /* Crucial for positioning nodes and lines */
  background: radial-gradient(circle, rgba(10, 20, 50, 0.5) 0%, rgba(5, 10, 30, 0.8) 70%);
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 0 20px var(--accent-color-primary, #00ffff), inset 0 0 15px rgba(0,0,0,0.5);
  overflow: hidden; /* Keep elements contained */
  color: var(--accent-color-primary, #00ffff);
}

.animation-text {
  position: absolute;
  font-size: 1.5rem;
  font-family: var(--font-family-primary);
  text-shadow: 0 0 5px currentColor;
  z-index: 10;
  animation: textPulse 2s infinite alternate;
}

.node-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.node {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: currentColor;
  border-radius: 50%;
  box-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
  opacity: 0;
  animation-name: nodePulse;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.connection-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
}

.line {
  position: absolute;
  background-color: currentColor;
  box-shadow: 0 0 3px currentColor;
  opacity: 0;
  animation-name: lineAppear;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite; /* Or a fixed number then fade out */
}

@keyframes nodePulse {
  0%, 100% {
    transform: scale(0.5);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes lineAppear {
  0%, 100% { opacity: 0; transform: scaleX(0.1) scaleY(0.1); }
  50% { opacity: 0.7; transform: scaleX(1) scaleY(1); }
}


@keyframes textPulse {
  from {
    opacity: 0.7;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .neural-network-container {
    height: 250px;
  }
  .animation-text {
    font-size: 1.2rem;
  }
  .node {
    width: 6px;
    height: 6px;
  }
}
</style>
