document.addEventListener('DOMContentLoaded', async () => {
    const episodeList = document.getElementById('episodeList');
    const popupPlayer = document.getElementById('popupPlayer');
    const popupVideo = document.getElementById('popupVideo');
    const closePlayer = document.getElementById('closePlayer');

    try {
        const response = await fetch('../sponge.json');
        const episodes = await response.json();

        episodes.forEach((episode, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <button class="play-btn" data-url="${episode.url}">
                    Episode ${index + 1}: ${episode.url.split('/').pop().replace('.mp4', '').replace(/-/g, ' ')}
                </button>
            `;
            episodeList.appendChild(listItem);
        });

        // Add event listeners to play buttons
        document.querySelectorAll('.play-btn').forEach(button => {
            button.addEventListener('click', () => {
                const videoUrl = button.getAttribute('data-url');
                popupVideo.src = videoUrl;
                popupPlayer.classList.remove('hidden');
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
