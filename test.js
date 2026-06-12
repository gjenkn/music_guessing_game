let artistId = null;
let songs = [];

const artistInput = document.getElementById("artistInput");
const searchBtn = document.getElementById("searchBtn");
const statusText = document.getElementById("status");
const songList = document.getElementById("songList");

searchBtn.addEventListener("click", () => {
    const artistName = artistInput.value.trim();

    if (!artistName) {
        statusText.textContent =
            "Enter an artist.";
        return;
    }

    songList.innerHTML = "";

    loadJsonp(
        `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=musicArtist&limit=1`,
        "handleArtistSearch"
    );
});

function handleArtistSearch(data) {

    if (data.resultCount === 0) {
        statusText.textContent =
            "Artist not found.";
        return;
    }

    const artist = data.results[0];

    artistId = artist.artistId;

    statusText.textContent =
        `Found ${artist.artistName}. Loading songs...`;

    loadJsonp(
        `https://itunes.apple.com/lookup?id=${artistId}&entity=song&limit=500`,
        "handleArtistSongs"
    );
}

function handleArtistSongs(data) {

    songs = data.results.filter(item =>
        item.wrapperType === "track" &&
        item.kind === "song" &&
        item.previewUrl
    );

    statusText.textContent =
        `Loaded ${songs.length} songs`;

    songList.innerHTML = "";

    songs.forEach(song => {

        const li = document.createElement("li");

        const text = document.createElement("span");

        text.textContent =
            `${song.trackName} (ID: ${song.trackId}) `;

        const playBtn = document.createElement("button");

        playBtn.textContent = "";

        playBtn.addEventListener("click", () => {
            playFiveSecondClip(song);
        });

        li.appendChild(text);
        li.appendChild(playBtn);

        songList.appendChild(li);
    });
}

function playFiveSecondClip(song) {

    console.log(
        "Playing:",
        song.trackName,
        song.trackId
    );

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

    script.src =
        `${url}&callback=${callbackName}`;

    document.body.appendChild(script);
}