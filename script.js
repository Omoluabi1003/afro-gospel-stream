document.addEventListener('DOMContentLoaded', () => {
  // Cached DOM elements
  const header = document.querySelector('.header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const counters = document.querySelectorAll('.counter');
  const playPauseBtn = document.getElementById('play-pause');
  const repeatBtn = document.getElementById('repeat');
  const shuffleBtn = document.getElementById('shuffle');
  const previousBtn = document.getElementById('previous');
  const nextBtn = document.getElementById('next');
  const progressBar = document.getElementById('progress-bar');
  const volumeBar = document.getElementById('volume-bar');
  const muteBtn = document.getElementById('mute');
  const loader = document.querySelector('.loader');

  // Insert albums and radio stations from data.js
  function renderAriyoContent() {
    if (typeof albums !== 'undefined') {
      const container = document.getElementById('ariyo-album-container');
      if (container) {
        albums.forEach(album => {
          const albumDiv = document.createElement('div');
          albumDiv.className = 'album';

          const headerDiv = document.createElement('div');
          headerDiv.className = 'album-header';
          headerDiv.setAttribute('role', 'button');
          headerDiv.setAttribute('aria-expanded', 'false');
          headerDiv.innerHTML = `
            <img src="${album.cover}" alt="${album.name} Cover" loading="lazy">
            <div>
              <h3>${album.name}</h3>
              <p>${album.tracks.length} Tracks</p>
            </div>
            <button class="album-toggle" aria-label="Toggle Album Tracks"><i class="fas fa-chevron-down"></i></button>
          `;

          const contentDiv = document.createElement('div');
          contentDiv.className = 'album-content';
          const ul = document.createElement('ul');
          ul.className = 'track-list';

          album.tracks.forEach(track => {
            const li = document.createElement('li');
            li.className = 'track-item';
            li.innerHTML = `
              <img src="${album.cover}" alt="${track.title} Thumbnail" loading="lazy">
              <div class="track-info">
                <h3><a href="#">${track.title}</a></h3>
                <p>${album.name}</p>
              </div>
              <audio controls>
                <source src="${track.src}" type="audio/mpeg">
                Your browser does not support the audio element.
              </audio>
            `;
            ul.appendChild(li);
          });

          contentDiv.appendChild(ul);
          albumDiv.appendChild(headerDiv);
          albumDiv.appendChild(contentDiv);
          container.appendChild(albumDiv);
        });
      }
    }

    if (typeof radioStations !== 'undefined') {
      const radioContainer = document.getElementById('radio-container');
      if (radioContainer) {
        radioStations.forEach(station => {
          const stationDiv = document.createElement('div');
          stationDiv.className = 'radio-station';
          stationDiv.innerHTML = `
            <img src="${station.logo}" alt="${station.name} logo" loading="lazy">
            <div>
              <h3>${station.name}</h3>
              <p>${station.location}</p>
              <audio controls>
                <source src="${station.url}" type="audio/mpeg">
                Your browser does not support the audio element.
              </audio>
            </div>
          `;
          radioContainer.appendChild(stationDiv);
        });
      }
    }
  }

  renderAriyoContent();

  const albumHeaders = document.querySelectorAll('.album-header');

// Sticky Header
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    header.classList.add('sticky');
  } else {
    header.classList.remove('sticky');
  }
});

// Smooth Scroll with Header Offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerHeight = header.offsetHeight;
      const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  });
});

// Counter Animation
const animateCounter = (counter) => {
  const target = +counter.getAttribute('data-target');
  const count = +counter.innerText.replace('k', '');
  const increment = target / 200;
  if (count < target) {
    counter.innerText = `${Math.ceil(count + increment)}k`;
    setTimeout(() => animateCounter(counter), 10);
  } else {
    counter.innerText = `${target}k`;
  }
};
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
counters.forEach(counter => observer.observe(counter));

// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
  nav.classList.toggle('active');
});

// Album Toggle
albumHeaders.forEach(header => {
  header.addEventListener('click', () => {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.album-toggle');
    const isExpanded = header.getAttribute('aria-expanded') === 'true';
    content.classList.toggle('active');
    header.setAttribute('aria-expanded', !isExpanded);
    toggle.innerHTML = isExpanded ? '<i class="fas fa-chevron-down"></i>' : '<i class="fas fa-chevron-up"></i>';
  });
});

// Loader
window.addEventListener('load', () => {
  setTimeout(() => loader.classList.add('hidden'), 1000);
});

// Audio Playback Control
let currentAudio = null;
let currentIndex = -1;
let isRepeating = false;
let isShuffling = false;
const playlist = [];
const audioElements = document.querySelectorAll('.track-item audio');

// Build playlist
audioElements.forEach((audio, index) => {
  const trackItem = audio.closest('.track-item');
  const album = trackItem.closest('.album');
  playlist.push({
    audio,
    index,
    artwork: trackItem.querySelector('img').src,
    title: trackItem.querySelector('h3 a').textContent,
    artist: 'Omoluabi Productions',
    album: album.querySelector('.album-header h3').textContent
  });
});

// Play specific track
function playTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  if (currentAudio && currentAudio !== playlist[index].audio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentIndex = index;
  currentAudio = playlist[index].audio;
  progressBar.value = 0;
  currentAudio.play();
  updatePlayerBar();
}

// Update player bar
function updatePlayerBar() {
  if (currentAudio && currentIndex >= 0) {
    const track = playlist[currentIndex];
    document.getElementById('player-artwork').src = track.artwork;
    document.getElementById('player-title').textContent = track.title;
    document.getElementById('player-artist').textContent = `${track.artist} - ${track.album}`;
    playPauseBtn.innerHTML = currentAudio.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    playPauseBtn.setAttribute('aria-label', currentAudio.paused ? `Play track: ${track.title}` : `Pause track: ${track.title}`);
  } else {
    document.getElementById('player-artwork').src = '';
    document.getElementById('player-title').textContent = '';
    document.getElementById('player-artist').textContent = '';
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    playPauseBtn.setAttribute('aria-label', 'Play track');
  }
}

// Audio event listeners
audioElements.forEach((audio, index) => {
  audio.addEventListener('play', () => {
    if (currentAudio && currentAudio !== audio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = audio;
    currentIndex = index;
    updatePlayerBar();
  });

  audio.addEventListener('timeupdate', () => {
    if (currentAudio === audio) {
      const progress = (audio.currentTime / audio.duration) * 100 || 0;
      progressBar.value = progress;
    }
  });

  audio.addEventListener('ended', () => {
    if (isRepeating) {
      audio.currentTime = 0;
      audio.play();
    } else if (isShuffling) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      playTrack(randomIndex);
    } else if (currentIndex + 1 < playlist.length) {
      playTrack(currentIndex + 1);
    } else {
      resetPlayerUI();
    }
  });
});

// Player controls
playPauseBtn.addEventListener('click', () => {
  if (currentAudio) {
    if (currentAudio.paused) {
      currentAudio.play();
    } else {
      currentAudio.pause();
    }
    updatePlayerBar();
  } else if (playlist.length > 0) {
    playTrack(0);
  }
});

previousBtn.addEventListener('click', () => {
  if (currentIndex >= 0) {
    if (isShuffling) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      playTrack(randomIndex);
    } else {
      const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      playTrack(prevIndex);
    }
  }
});

nextBtn.addEventListener('click', () => {
  if (currentIndex >= 0) {
    if (isShuffling) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      playTrack(randomIndex);
    } else {
      const nextIndex = (currentIndex + 1) % playlist.length;
      playTrack(nextIndex);
    }
  }
});

repeatBtn.addEventListener('click', () => {
  isRepeating = !isRepeating;
  repeatBtn.classList.toggle('active', isRepeating);
  if (currentAudio) {
    currentAudio.loop = isRepeating;
  }
  repeatBtn.setAttribute('aria-label', isRepeating ? 'Disable repeat' : 'Enable repeat');
});

shuffleBtn.addEventListener('click', () => {
  isShuffling = !isShuffling;
  shuffleBtn.classList.toggle('active', isShuffling);
  shuffleBtn.setAttribute('aria-label', isShuffling ? 'Disable shuffle' : 'Enable shuffle');
  shuffleBtn.setAttribute('aria-pressed', isShuffling);
});

progressBar.addEventListener('input', () => {
  if (currentAudio) {
    const time = (progressBar.value / 100) * currentAudio.duration;
    currentAudio.currentTime = time;
  }
});

volumeBar.addEventListener('input', () => {
  if (currentAudio) {
    currentAudio.volume = volumeBar.value;
  }
});

muteBtn.addEventListener('click', () => {
  if (currentAudio) {
    currentAudio.muted = !currentAudio.muted;
    muteBtn.innerHTML = currentAudio.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    muteBtn.setAttribute('aria-label', currentAudio.muted ? 'Unmute track' : 'Mute track');
  }
});

// PWA Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(() => {
    console.log('Service Worker registered successfully');
  }).catch(error => {
    console.error('Service Worker registration failed:', error);
  });
}

// Reset player to initial state
function resetPlayerUI() {
  progressBar.value = 0;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = null;
  currentIndex = -1;
  updatePlayerBar();
}

});
