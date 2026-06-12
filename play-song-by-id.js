const songIdInput = document.getElementById("songIdInput");
const playBtn = document.getElementById("playBtn");
const statusText = document.getElementById("status");

playBtn.addEventListener("click", () => {
    const songId = songIdInput.value.trim();

    if (songId === "") {
        statusText.textContent = "Enter a song ID first.";
        return;
    }

    statusText.textContent = "Loading song...";

    loadJsonp(
        `https://itunes.apple.com/lookup?id=${songId}`,
        "handleSongLookup"
    );
});

function handleSongLookup(data) {
    const song = data.results[0];

    if (!song || !song.previewUrl) {
        statusText.textContent = "No preview found for this ID.";
        return;
    }

    statusText.textContent =
        `Playing: ${song.trackName} by ${song.artistName}`;

    const audio = new Audio(song.previewUrl);

    audio.addEventListener("loadedmetadata", () => {
        audio.currentTime = 0;
        audio.play();

        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
        }, 2000);
    });
}

function loadJsonp(url, callbackName) {
    const script = document.createElement("script");
    script.src = `${url}&callback=${callbackName}`;
    document.body.appendChild(script);
}