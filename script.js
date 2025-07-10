console.log("script.js: Starting execution");

// Declare variables for DOM elements globally, but assign them within DOMContentLoaded
let header, menuToggle, nav, counters,
    playPauseBtn, repeatBtn, shuffleBtn, previousBtn, nextBtn,
    progressBar, volumeBar, muteBtn, loader;

console.log("script.js: Global DOM element variables declared.");

// --- DYNAMIC CONTENT RENDERING AND PLAYLIST LOGIC --- (Functions defined before DOMContentLoaded)
console.log("script.js: Defining dynamic content functions.");

function initializeAlbumToggles() {
    console.log("script.js: initializeAlbumToggles called");
    const newAlbumHeaders = document.querySelectorAll('.album-header');
    console.log(`script.js: Found ${newAlbumHeaders.length} album headers for toggles.`);
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

function renderAlbumsAndPlaylist() {
    console.log("script.js: renderAlbumsAndPlaylist called");
    const albumsContainer = document.getElementById('albums');
    if (!albumsContainer) {
        console.error('script.js: Albums container (#albums) not found! Cannot render albums.');
        return;
    }
    console.log("script.js: Albums container found.");

    const existingH2 = albumsContainer.querySelector('h2');
    albumsContainer.innerHTML = '';
    if (existingH2) albumsContainer.appendChild(existingH2);

    if (typeof albums === 'undefined' || !Array.isArray(albums)) {
        console.error('script.js: Global `albums` data (from data.js) is not available or not an array.');
        albumsContainer.innerHTML += '<p>Error: Could not load album data. `albums` variable is missing or not an array.</p>';
        return;
    }
    console.log(`script.js: 'albums' data found with ${albums.length} items.`);

    playlist.length = 0;
    let globalTrackIndex = 0;
    console.log("script.js: Starting to iterate through albums data.");

    albums.forEach((albumData, albumIndex) => {
        console.log(`script.js: Processing album ${albumIndex + 1}: ${albumData.name}`);
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
            console.log(`script.js: Album '${albumData.name}' has ${albumData.tracks.length} tracks. Processing tracks.`);
            albumData.tracks.forEach((trackData) => {
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
                    artist: 'Omoluabi',
                    album: albumData.name || 'Unknown Album'
                });

                trackListUl.appendChild(trackItemLi);
                globalTrackIndex++;
            });
        } else {
            console.warn(`script.js: Album '${albumData.name}' has no tracks array or it's not an array.`);
        }
        albumContentDiv.appendChild(trackListUl);
        albumDiv.appendChild(albumHeaderDiv);
        albumDiv.appendChild(albumContentDiv);
        albumsContainer.appendChild(albumDiv);
    });
    console.log("script.js: Finished iterating albums. Total tracks pushed to playlist: " + playlist.length);

    console.log("script.js: Calling initializeAlbumToggles()");
    initializeAlbumToggles();
    console.log("script.js: Calling initializeAudioEventListeners()");
    initializeAudioEventListeners();
    console.log("script.js: renderAlbumsAndPlaylist finished.");
}

function initializeAudioEventListeners() {
    console.log("script.js: initializeAudioEventListeners called. Processing " + playlist.length + " tracks.");
    playlist.forEach(trackInfo => {
        const audio = trackInfo.audio;
        if (!audio || audio.dataset.listenerAttached === 'true') return;

        audio.addEventListener('play', () => {
            if (currentAudio !== audio && currentAudio) currentAudio.pause();
            currentAudio = audio;
            currentIndex = playlist.findIndex(item => item.audio === audio);
            updatePlayerBar();
        });
        audio.addEventListener('timeupdate', () => {
            if (currentAudio === audio && audio.duration) {
                progressBar.value = (audio.currentTime / audio.duration) * 100;
            } else if (currentAudio === audio) {
                progressBar.value = 0;
            }
        });
        audio.addEventListener('ended', () => {
            if (isRepeating && currentAudio === audio) { audio.currentTime = 0; audio.play(); }
            else if (isShuffling) playTrack(Math.floor(Math.random() * playlist.length));
            else if (currentIndex + 1 < playlist.length) playTrack(currentIndex + 1);
            else resetPlayerUI();
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
    console.log("script.js: initializeAudioEventListeners finished.");
}

// Audio Playback Control Variables
let currentAudio = null;
let currentIndex = -1;
let isRepeating = false;
let isShuffling = false;
const playlist = [];
console.log("script.js: Playback control variables initialized.");

function playTrack(index) {
    console.log(`script.js: playTrack called with index: ${index}`);
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
    if (progressBar) progressBar.value = 0;
    currentAudio.play().catch(e => console.error("Error playing track:", trackToPlay.title, e));
    updatePlayerBar();
}

function updatePlayerBar() {
    // console.log("script.js: updatePlayerBar called. Current index: " + currentIndex);
    if (currentAudio && currentIndex >= 0 && playlist[currentIndex]) {
        const track = playlist[currentIndex];
        if (document.getElementById('player-artwork')) document.getElementById('player-artwork').src = track.artwork;
        if (document.getElementById('player-title')) document.getElementById('player-title').textContent = track.title;
        if (document.getElementById('player-artist')) document.getElementById('player-artist').textContent = `${track.artist} - ${track.album} (2025)`;
        if (playPauseBtn) {
            playPauseBtn.innerHTML = currentAudio.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
            playPauseBtn.setAttribute('aria-label', currentAudio.paused ? `Play track: ${track.title}` : `Pause track: ${track.title}`);
        }
    } else {
        if (document.getElementById('player-artwork')) document.getElementById('player-artwork').src = 'icon-192.png';
        if (document.getElementById('player-title')) document.getElementById('player-title').textContent = 'No Track Selected';
        if (document.getElementById('player-artist')) document.getElementById('player-artist').textContent = '';
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            playPauseBtn.setAttribute('aria-label', 'Play track');
        }
    }
}

function resetPlayerUI() {
    console.log("script.js: resetPlayerUI called");
    if (progressBar) progressBar.value = 0;
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    currentAudio = null;
    currentIndex = -1;
    updatePlayerBar();
}


// Initial setup on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    console.log("script.js: DOMContentLoaded event fired.");

    // Assign DOM elements now that the DOM is ready
    header = document.querySelector('.header');
    menuToggle = document.querySelector('.menu-toggle');
    nav = document.querySelector('.nav');
    counters = document.querySelectorAll('.counter'); // Query counters here
    playPauseBtn = document.getElementById('play-pause');
    repeatBtn = document.getElementById('repeat');
    shuffleBtn = document.getElementById('shuffle');
    previousBtn = document.getElementById('previous');
    nextBtn = document.getElementById('next');
    progressBar = document.getElementById('progress-bar');
    volumeBar = document.getElementById('volume-bar');
    muteBtn = document.getElementById('mute');
    loader = document.querySelector('.loader');
    console.log("script.js: DOM elements assigned inside DOMContentLoaded", { header, menuToggle, nav, counters, playPauseBtn, loader });

    // Initialize functionalities that depend on these elements
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) header.classList.add('sticky');
            else header.classList.remove('sticky');
        });
    } else {
        console.warn("script.js: Header element not found for sticky scroll (checked in DOMContentLoaded).");
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement && header) {
                const headerHeight = header.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerHeight;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            } else if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    if (counters && counters.length > 0) {
        const animateCounter = (counter) => {
            const target = +counter.getAttribute('data-target');
            const countVal = +counter.innerText.replace('k', '');
            const increment = target / 200;
            if(countVal < target) {
                counter.innerText = `${Math.ceil(countVal + increment)}k`;
                setTimeout(() => animateCounter(counter), 10);
            } else {
                counter.innerText = `${target}k`;
            }
        };
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(counter => counterObserver.observe(counter));
    } else {
        // console.log("script.js: No counter elements found (checked in DOMContentLoaded).");
    }

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => nav.classList.toggle('active'));
    } else {
        console.warn("script.js: Menu toggle or nav element not found (checked in DOMContentLoaded).");
    }

    // Player controls event listeners
    if (playPauseBtn) playPauseBtn.addEventListener('click', () => {
        if (!currentAudio && playlist.length > 0) playTrack(0);
        else if (currentAudio) {
            if (currentAudio.paused) currentAudio.play().catch(e => console.error("Play error:", e));
            else currentAudio.pause();
            updatePlayerBar();
        }
    });
    if (previousBtn) previousBtn.addEventListener('click', () => {
        if (currentIndex >= 0) {
            let prevIdx = isShuffling ? Math.floor(Math.random() * playlist.length) : (currentIndex - 1 + playlist.length) % playlist.length;
            playTrack(prevIdx);
        }
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        if (currentIndex >= 0) {
            let nextIdx = isShuffling ? Math.floor(Math.random() * playlist.length) : (currentIndex + 1) % playlist.length;
            playTrack(nextIdx);
        } else if (playlist.length > 0) playTrack(0);
    });
    if (repeatBtn) repeatBtn.addEventListener('click', () => {
        isRepeating = !isRepeating;
        repeatBtn.classList.toggle('active', isRepeating);
        repeatBtn.setAttribute('aria-label', isRepeating ? 'Disable repeat' : 'Enable repeat');
    });
    if (shuffleBtn) shuffleBtn.addEventListener('click', () => {
        isShuffling = !isShuffling;
        shuffleBtn.classList.toggle('active', isShuffling);
        shuffleBtn.setAttribute('aria-label', isShuffling ? 'Disable shuffle' : 'Enable shuffle');
        shuffleBtn.setAttribute('aria-pressed', String(isShuffling));
    });
    if (progressBar) progressBar.addEventListener('input', () => {
        if (currentAudio && currentAudio.duration) currentAudio.currentTime = (progressBar.value / 100) * currentAudio.duration;
    });
    if (volumeBar) volumeBar.addEventListener('input', () => {
        if (currentAudio) currentAudio.volume = volumeBar.value;
    });
    if (muteBtn) muteBtn.addEventListener('click', () => {
        if (currentAudio) {
            currentAudio.muted = !currentAudio.muted;
            muteBtn.innerHTML = currentAudio.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
            muteBtn.setAttribute('aria-label', currentAudio.muted ? 'Unmute track' : 'Mute track');
            if(volumeBar) volumeBar.value = currentAudio.muted ? 0 : currentAudio.volume;
        }
    });

    console.log("script.js: Calling renderAlbumsAndPlaylist from DOMContentLoaded.");
    renderAlbumsAndPlaylist();

    console.log("script.js: Calling updatePlayerBar from DOMContentLoaded for initial UI.");
    updatePlayerBar();

    if (loader && typeof loader.classList !== 'undefined') {
        console.log("script.js: Scheduling loader hiding.");
        setTimeout(() => {
            console.log("script.js: Hiding loader now.");
            loader.classList.add('hidden');
        }, 250); // Shortened timeout
    } else {
        console.warn("script.js: Loader element .loader not found in HTML or no classList property (checked in DOMContentLoaded).");
    }

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(() => {
            console.log('script.js: Service Worker registered successfully (from DOMContentLoaded)');
        }).catch(error => {
            console.error('script.js: Service Worker registration failed (from DOMContentLoaded):', error);
        });
    }
    console.log("script.js: DOMContentLoaded handler finished.");
});

console.log("script.js: Reached end of script file evaluation.");
