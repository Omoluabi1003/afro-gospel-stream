// Cached DOM elements - These should be fine as they are general page elements
const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const counters = document.querySelectorAll('.counter');
// albumHeaders will be queried after dynamic rendering
const playPauseBtn = document.getElementById('play-pause');
const repeatBtn = document.getElementById('repeat');
const shuffleBtn = document.getElementById('shuffle');
const previousBtn = document.getElementById('previous');
const nextBtn = document.getElementById('next');
const progressBar = document.getElementById('progress-bar');
const volumeBar = document.getElementById('volume-bar');
const muteBtn = document.getElementById('mute');
const loader = document.querySelector('.loader');

// Sticky Header
if (header) { // Check if header exists
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });
}

// Smooth Scroll with Header Offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement && header) { // Check if header exists
            const headerHeight = header.offsetHeight;
            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerHeight;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        } else if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Counter Animation
if (counters.length > 0) { // Check if counters exist
    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText.replace('k', ''); // Assuming 'k' suffix
        const increment = target / 200; // Animation speed
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
}

// Mobile Menu Toggle
if (menuToggle && nav) { // Check if elements exist
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
}

// --- NEW DYNAMIC CONTENT RENDERING AND PLAYLIST LOGIC ---

// Album Toggle Logic (will be applied after albums are rendered)
function initializeAlbumToggles() {
  const newAlbumHeaders = document.querySelectorAll('.album-header');
  newAlbumHeaders.forEach(headerElem => {
    if (headerElem.dataset.listenerAttached === 'true') return;
    headerElem.addEventListener('click', () => {
      const content = headerElem.nextElementSibling;
      const toggleButton = headerElem.querySelector('.album-toggle');
      const isExpanded = headerElem.getAttribute('aria-expanded') === 'true';

      if (content) content.classList.toggle('active');
      headerElem.setAttribute('aria-expanded', String(!isExpanded));
      if (toggleButton) {
        toggleButton.innerHTML = !isExpanded ? '<i class="fas fa-chevron-up"></i>' : '<i class="fas fa-chevron-down"></i>';
      }
    });
    headerElem.dataset.listenerAttached = 'true';
  });
}

// Function to render albums and build the playlist
function renderAlbumsAndPlaylist() {
  const albumsContainer = document.getElementById('albums');
  if (!albumsContainer) {
    console.error('Albums container (#albums) not found!');
    return;
  }

  const existingH2 = albumsContainer.querySelector('h2');
  albumsContainer.innerHTML = '';
  if(existingH2) albumsContainer.appendChild(existingH2);

  if (typeof albums === 'undefined' || !Array.isArray(albums)) {
    console.error('Global `albums` data (from data.js) is not available.');
    albumsContainer.innerHTML += '<p>Error: Could not load album data.</p>';
    return;
  }

  playlist.length = 0;
  let globalTrackIndex = 0;

  albums.forEach(albumData => {
    const albumDiv = document.createElement('div');
    albumDiv.className = 'album';

    const albumHeaderDiv = document.createElement('div');
    albumHeaderDiv.className = 'album-header';
    albumHeaderDiv.setAttribute('aria-expanded', 'false');
    albumHeaderDiv.innerHTML = `
      <img src="${albumData.cover || 'icon-192.png'}" alt="${albumData.name || 'Album'} Cover Art" loading="lazy">
      <div>
        <h3>${albumData.name || 'Unknown Album'}</h3>
        <p>${albumData.tracks ? albumData.tracks.length : 0} tracks</p>
      </div>
      <button class="album-toggle" aria-label="Toggle tracks"><i class="fas fa-chevron-down"></i></button>
    `;

    const albumContentDiv = document.createElement('div');
    albumContentDiv.className = 'album-content';

    const trackListUl = document.createElement('ul');
    trackListUl.className = 'track-list';

    if (albumData.tracks && Array.isArray(albumData.tracks)) {
      albumData.tracks.forEach(trackData => {
        const trackItemLi = document.createElement('li');
        trackItemLi.className = 'track-item';

        const audioElement = new Audio(trackData.src);
        audioElement.preload = 'metadata';

        trackItemLi.innerHTML = `
          <img src="${albumData.cover || 'icon-192.png'}" alt="${albumData.name || 'Album'} Artwork" loading="lazy">
          <div class="track-info">
            <h3><a href="#" role="button" data-track-index="${globalTrackIndex}">${trackData.title || 'Unknown Track'}</a></h3>
            <p>${albumData.name || 'Unknown Album'}</p>
          </div>
        `;

        const trackTitleLink = trackItemLi.querySelector('.track-info h3 a');
        if (trackTitleLink) {
          trackTitleLink.addEventListener('click', (e) => {
            e.preventDefault();
            playTrack(parseInt(e.target.dataset.trackIndex, 10));
          });
        }

        playlist.push({
          audio: audioElement,
          index: globalTrackIndex,
          artwork: albumData.cover || 'icon-192.png',
          title: trackData.title || 'Unknown Track',
          artist: 'Omoluabi', // Hardcoded artist name
          album: albumData.name || 'Unknown Album'
        });

        trackListUl.appendChild(trackItemLi);
        globalTrackIndex++;
      });
    }

    albumContentDiv.appendChild(trackListUl);
    albumDiv.appendChild(albumHeaderDiv);
    albumDiv.appendChild(albumContentDiv);
    albumsContainer.appendChild(albumDiv);
  });

  initializeAlbumToggles();
  initializeAudioEventListeners();
}

// Initialize event listeners for audio elements
function initializeAudioEventListeners() {
  playlist.forEach(trackInfo => {
    const audio = trackInfo.audio;
    if (!audio || audio.dataset.listenerAttached === 'true') return;

    audio.addEventListener('play', () => {
      if (currentAudio !== audio && currentAudio) {
          currentAudio.pause();
      }
      currentAudio = audio;
      currentIndex = playlist.findIndex(item => item.audio === audio);
      updatePlayerBar();
    });

    audio.addEventListener('timeupdate', () => {
      if (currentAudio === audio && audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
      } else if (currentAudio === audio) {
        progressBar.value = 0;
      }
    });

    audio.addEventListener('ended', () => {
      if (isRepeating && currentAudio === audio) {
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

    audio.addEventListener('error', (e) => {
      console.error(`Error with audio: ${trackInfo.title}`, e);
      const trackLink = document.querySelector(`a[data-track-index="${trackInfo.index}"]`);
      if (trackLink) {
        const trackItem = trackLink.closest('.track-item');
        if (trackItem) {
            trackItem.classList.add('track-error');
            trackItem.title = 'Error loading this track.';
            let errorSpan = trackItem.querySelector('.error-indicator');
            if (!errorSpan) {
                errorSpan = document.createElement('span');
                errorSpan.className = 'error-indicator';
                errorSpan.textContent = ' (Error)';
                errorSpan.style.color = 'var(--accent-color-secondary, red)';
                trackLink.parentNode.appendChild(errorSpan);
            }
        }
      }
    });
    audio.dataset.listenerAttached = 'true';
  });
}

// --- END OF NEW DYNAMIC CONTENT LOGIC ---

// Audio Playback Control Variables
let currentAudio = null;
let currentIndex = -1;
let isRepeating = false;
let isShuffling = false;
const playlist = []; // This is now populated by renderAlbumsAndPlaylist

// Old static playlist building logic is REMOVED.
// const audioElements = document.querySelectorAll('.track-item audio');
// audioElements.forEach((audio, index) => { ... });

// Play specific track
function playTrack(index) {
  if (index < 0 || index >= playlist.length || !playlist[index]) {
    console.warn("Invalid track index or playlist item not found:", index);
    return;
  }

  const trackToPlay = playlist[index];

  if (currentAudio && currentAudio !== trackToPlay.audio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentIndex = index;
  currentAudio = trackToPlay.audio;

  if (!currentAudio) {
      console.error("Audio element is null for track:", trackToPlay.title);
      return;
  }

  progressBar.value = 0;
  currentAudio.play().catch(e => console.error("Error playing track:", trackToPlay.title, e));
  updatePlayerBar();
}

// Update player bar
function updatePlayerBar() {
  if (currentAudio && currentIndex >= 0 && playlist[currentIndex]) {
    const track = playlist[currentIndex];
    if(document.getElementById('player-artwork')) document.getElementById('player-artwork').src = track.artwork;
    if(document.getElementById('player-title')) document.getElementById('player-title').textContent = track.title;
    if(document.getElementById('player-artist')) document.getElementById('player-artist').textContent = `${track.artist} - ${track.album} (2025)`; // Added year
    if(playPauseBtn) {
        playPauseBtn.innerHTML = currentAudio.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
        playPauseBtn.setAttribute('aria-label', currentAudio.paused ? `Play track: ${track.title}` : `Pause track: ${track.title}`);
    }
  } else {
    if(document.getElementById('player-artwork')) document.getElementById('player-artwork').src = 'icon-192.png'; // Default image
    if(document.getElementById('player-title')) document.getElementById('player-title').textContent = 'No Track Selected';
    if(document.getElementById('player-artist')) document.getElementById('player-artist').textContent = '';
    if(playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        playPauseBtn.setAttribute('aria-label', 'Play track');
    }
  }
}

// Audio event listeners are now initialized in initializeAudioEventListeners()

// Player controls - Event listeners for buttons
if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
        if (!currentAudio && playlist.length > 0) { // If no current audio but playlist exists, play first track
            playTrack(0);
        } else if (currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play().catch(e => console.error("Error playing on button click:", e));
            } else {
                currentAudio.pause();
            }
            updatePlayerBar(); // Ensure this is called to update button icon
        }
    });
}

if (previousBtn) {
    previousBtn.addEventListener('click', () => {
        if (currentIndex >= 0) {
            let prevIndex;
            if (isShuffling) {
                prevIndex = Math.floor(Math.random() * playlist.length);
            } else {
                prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
            }
            playTrack(prevIndex);
        }
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (currentIndex >= 0) {
            let nextIndex;
            if (isShuffling) {
                nextIndex = Math.floor(Math.random() * playlist.length);
            } else {
                nextIndex = (currentIndex + 1) % playlist.length;
            }
            playTrack(nextIndex);
        } else if (playlist.length > 0) { // If no current track, play first
            playTrack(0);
        }
    });
}

if (repeatBtn) {
    repeatBtn.addEventListener('click', () => {
        isRepeating = !isRepeating;
        repeatBtn.classList.toggle('active', isRepeating);
        // Loop property on audio element is handled by 'ended' event logic for more control
        repeatBtn.setAttribute('aria-label', isRepeating ? 'Disable repeat' : 'Enable repeat');
    });
}

if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
        isShuffling = !isShuffling;
        shuffleBtn.classList.toggle('active', isShuffling);
        shuffleBtn.setAttribute('aria-label', isShuffling ? 'Disable shuffle' : 'Enable shuffle');
        shuffleBtn.setAttribute('aria-pressed', String(isShuffling));
    });
}

if (progressBar) {
    progressBar.addEventListener('input', () => {
        if (currentAudio && currentAudio.duration) {
            const time = (progressBar.value / 100) * currentAudio.duration;
            currentAudio.currentTime = time;
        }
    });
}

if (volumeBar) {
    volumeBar.addEventListener('input', () => {
        if (currentAudio) {
            currentAudio.volume = volumeBar.value;
        }
    });
}

if (muteBtn) {
    muteBtn.addEventListener('click', () => {
        if (currentAudio) {
            currentAudio.muted = !currentAudio.muted;
            muteBtn.innerHTML = currentAudio.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
            muteBtn.setAttribute('aria-label', currentAudio.muted ? 'Unmute track' : 'Mute track');
            // Update volume bar to reflect mute state if desired (e.g., set to 0 or disable)
            if(volumeBar) volumeBar.value = currentAudio.muted ? 0 : currentAudio.volume;
        }
    });
}

// PWA Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(() => {
    // console.log('Service Worker registered successfully');
  }).catch(error => {
    console.error('Service Worker registration failed:', error);
  });
}

// Reset player to initial state
function resetPlayerUI() {
  if(progressBar) progressBar.value = 0;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = null;
  currentIndex = -1;
  updatePlayerBar();
}

// Initial setup on DOMContentLoaded - This will run all initialization logic
window.addEventListener('DOMContentLoaded', () => {
    // The original query for albumHeaders is removed from top, as it's done in initializeAlbumToggles
    // const albumHeaders = document.querySelectorAll('.album-header');

    renderAlbumsAndPlaylist();
    updatePlayerBar(); // Initial call to set player bar text

    if (loader && typeof loader.classList !== 'undefined') {
      setTimeout(() => loader.classList.add('hidden'), 250); // Hide loader
    } else if (loader === null) {
      // console.warn("Loader element .loader not found in HTML.");
    }
});
