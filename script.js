document.addEventListener('DOMContentLoaded', async () => {
    const episodeList = document.getElementById('episodeList');
    const popupPlayer = document.getElementById('popupPlayer');
    const popupVideo = document.getElementById('popupVideo');
    const closePlayer = document.getElementById('closePlayer');
    const playAllBtn = document.getElementById('playAllBtn');
    const skipBackBtn = document.getElementById('skipBackBtn');
    const skipForwardBtn = document.getElementById('skipForwardBtn');
    const nextEpisodeBtn = document.getElementById('nextEpisodeBtn');

    let episodes = [];
    let playlist = [];
    let currentIndex = 0;
    let playAllMode = false;
    let nextTimeout = null;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    function playEpisode(index) {
        if (index < 0 || index >= playlist.length) return;
        currentIndex = index;
        popupVideo.src = playlist[currentIndex].url;
        popupVideo.load();
        popupPlayer.classList.remove('hidden');
        popupVideo.play();
    }

    function playNextEpisode() {
        if (currentIndex + 1 < playlist.length) {
            playEpisode(currentIndex + 1);
        } else {
            playAllMode = false;
            popupPlayer.classList.add('hidden');
            popupVideo.pause();
            popupVideo.src = '';
        }
    }

    try {
        const response = await fetch('./sponge.json');
        episodes = await response.json();

        episodes.forEach((episode, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <button class="play-btn" data-index="${index}" data-url="${episode.url}">
                    Episode ${index + 1}: ${episode.url.split('/').pop().replace('.mp4', '').replace(/-/g, ' ')}
                </button>
                <button class="vlc-btn episode-vlc-btn" data-url="${episode.url}">
                    Open in VLC
                </button>
            `;
            episodeList.appendChild(listItem);
        });

        // Play single episode
        document.querySelectorAll('.play-btn').forEach(button => {
            button.addEventListener('click', () => {
                playlist = episodes;
                playAllMode = false;
                playEpisode(Number(button.getAttribute('data-index')));
            });
        });

        // Only attach VLC handler to episode VLC buttons, not Play All
        document.querySelectorAll('.episode-vlc-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const videoUrl = button.getAttribute('data-url');
                if (isMobile) {
                    window.location.href = `vlc://${videoUrl}`;
                    setTimeout(() => {
                        alert("If VLC Media Player didn't open, please install it from your app store.");
                    }, 1000);
                } else {
                    window.open(videoUrl, '_blank');
                }
            });
        });

        // Play All button
        playAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playlist = episodes;
            playAllMode = true;
            playEpisode(0);
        });

        // Skip controls
        skipBackBtn.addEventListener('click', () => {
            popupVideo.currentTime = Math.max(0, popupVideo.currentTime - 5);
        });
        skipForwardBtn.addEventListener('click', () => {
            popupVideo.currentTime = Math.min(popupVideo.duration, popupVideo.currentTime + 5);
        });
        nextEpisodeBtn.addEventListener('click', () => {
            playNextEpisode();
        });

        // Keyboard controls
        popupVideo.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                popupVideo.currentTime = Math.max(0, popupVideo.currentTime - 5);
            } else if (e.key === 'ArrowRight') {
                popupVideo.currentTime = Math.min(popupVideo.duration, popupVideo.currentTime + 5);
            } else if (e.key === 'n' || e.key === 'N') {
                playNextEpisode();
            }
        });
        // Focus video for keyboard events
        popupPlayer.addEventListener('click', () => popupVideo.focus());

        // Next episode autoplay after 5s, always (not just playAllMode)
        popupVideo.addEventListener('ended', () => {
            if (currentIndex + 1 < playlist.length) {
                nextTimeout = setTimeout(() => {
                    playNextEpisode();
                }, 5000);
            }
        });

        // If user interacts, cancel next timeout
        popupVideo.addEventListener('play', () => {
            if (nextTimeout) {
                clearTimeout(nextTimeout);
                nextTimeout = null;
            }
        });

        // Close popup
        closePlayer.addEventListener('click', () => {
            popupPlayer.classList.add('hidden');
            popupVideo.pause();
            popupVideo.src = '';
            playAllMode = false;
            if (nextTimeout) {
                clearTimeout(nextTimeout);
                nextTimeout = null;
            }
        });
    } catch (error) {
        console.error('Error loading episodes:', error);
        episodeList.innerHTML = '<li>Failed to load episodes.</li>';
    }
});
