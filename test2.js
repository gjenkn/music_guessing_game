const songInput = document.getElementById("songInput");
const searchBtn = document.getElementById("searchBtn");
const statusText = document.getElementById("status");
const songList = document.getElementById("songList");

searchBtn.addEventListener("click", () => {
    const songTitle = songInput.value.trim();

    if (!songTitle) {
        statusText.textContent = "Enter a song title.";
        return;
    }

    songList.innerHTML = "";
    statusText.textContent = "Searching...";

    loadJsonp(
        `https://itunes.apple.com/search?term=${encodeURIComponent(songTitle)}&entity=song&limit=50`,
        "handleSongSearch"
    );
});

function handleSongSearch(data) {
    const songs = data.results.filter(item =>
        item.wrapperType === "track" &&
        item.kind === "song"
    );

    statusText.textContent =
        `Found ${songs.length} songs`;

    songList.innerHTML = "";

    songs.forEach(song => {
        const li = document.createElement("li");

        li.textContent =
            `${song.trackName} — ${song.artistName} (ID: ${song.trackId})`;

        songList.appendChild(li);
    });
}

function loadJsonp(url, callbackName) {
    const script = document.createElement("script");

    script.src =
        `${url}&callback=${callbackName}`;

    document.body.appendChild(script);
}