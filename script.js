document.addEventListener('DOMContentLoaded', async () => {
    const episodeList = document.getElementById('episodeList');
    const popupPlayer = document.getElementById('popupPlayer');
    const popupVideo = document.getElementById('popupVideo');
    const closePlayer = document.getElementById('closePlayer');

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
        const response = await fetch('./sponge.json'); // Updated path to sponge.json
        const episodes = await response.json();

        episodes.forEach((episode, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <button class="play-btn" data-url="${episode.url}">
                    Episode ${index + 1}: ${episode.url.split('/').pop().replace('.mp4', '').replace(/-/g, ' ')}
                </button>
                <button class="vlc-btn" data-url="${episode.url}">
                    Open in VLC
                </button>
            `;
            episodeList.appendChild(listItem);
        });

        // Add event listeners to play buttons
        document.querySelectorAll('.play-btn').forEach(button => {
            button.addEventListener('click', () => {
                const videoUrl = button.getAttribute('data-url');
                popupVideo.src = videoUrl;
                popupVideo.load(); // Ensure the video is reloaded
                popupPlayer.classList.remove('hidden');
            });
        });

        // Add event listeners to VLC buttons
        document.querySelectorAll('.vlc-btn').forEach(button => {
            button.addEventListener('click', () => {
                const videoUrl = button.getAttribute('data-url');
                if (isMobile) {
                    // On mobile, prompt to open or install VLC
                    const vlcUrl = `vlc://${videoUrl}`;
                    window.location.href = vlcUrl;

                    setTimeout(() => {
                        alert(
                            "If VLC Media Player didn't open, please install it from your app store."
                        );
                    }, 1000);
                } else {
                    // On desktop, open the video in VLC
                    window.open(videoUrl, '_blank');
                }
            });
        });

        // Close the popup player
        closePlayer.addEventListener('click', () => {
            popupPlayer.classList.add('hidden');
            popupVideo.pause();
            popupVideo.src = '';
        });
    } catch (error) {
        console.error('Error loading episodes:', error);
        episodeList.innerHTML = '<li>Failed to load episodes.</li>';
    }
});
