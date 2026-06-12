let currentSong = null;
let currentPreviewUrl = null;
let currentClipStart = null;

let currentSongPool = [];

let roundCount = 0;
let correctCount = 0;
let gaveUpCount = 0;

let clipLength = 1;

let lives = 5;
let guessesLeft = 3;

let remainingSongs = [];

const difficultySelect = document.getElementById("difficultySelect");

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");

const groupInput = document.getElementById("groupInput");
const startBtn = document.getElementById("startBtn");

const scoreText = document.getElementById("scoreText");
const statusText = document.getElementById("status");
const livesText = document.getElementById("livesText");

const playBtn = document.getElementById("playBtn");

const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");

const giveUpBtn = document.getElementById("giveUpBtn");
const restartBtn = document.getElementById("restartBtn");

const artistOptions = document.getElementById("artistOptions");

const selectedGroupsText = document.getElementById("selectedGroupsText");

const GROUP_ALIASES = {
    "le sserafim": "le sserafim",
    "lesserafim": "le sserafim",
    "hearts 2 hearts": "hearts2hearts",
    "hearts2hearts": "hearts2hearts",
    "h2h": "hearts2hearts",
    "ive": "ive",
    "aespa": "aespa",
    "kiof": "kiss of life",
    "kissoflife": "kiss of life",
    "kiss of life": "kiss of life",
    "nwjns": "newjeans",
    "newjeans": "newjeans",
    "njs": "newjeans"
};

startBtn.addEventListener("click", startGame);
playBtn.addEventListener("click", playOneSecondClip);
guessBtn.addEventListener("click", checkGuess);
giveUpBtn.addEventListener("click", giveUp);
restartBtn.addEventListener("click", resetGame);

function normalizeGroupName(group) {
    const cleaned = group
        .toLowerCase()
        .trim();

    return GROUP_ALIASES[cleaned] || cleaned.replace(/\s+/g, "");
}

function startGame() {
    lives = 5;
    const groupNames = groupInput.value
        .split(",")
        .map(group => normalizeGroupName(group))
        .filter(group => group !== "");

    if (groupNames.length === 0) {
        alert("Enter at least one group.");
        return;
    } else if (groupNames.includes("rebecca")) {
        const rebeccaGroups = [
            "ive",
            "aespa",
            "hearts2hearts",
            "le sserafim",
            "illit",
            "babymonster",
            "izna",
            "kiiikiii",
            "katseye",
            "kiss of life",
            "twice",
            "idle",
            "newjeans"
        ];

        const rebeccaIndex = groupNames.indexOf("rebecca");

        groupNames.splice(
            rebeccaIndex,
            1,
            ...rebeccaGroups
        );
    }
    let possibleSongs = [];

    for (const groupName of groupNames) {
        if (!SONG_DATABASE[groupName]) {
            alert(`Group not found: ${groupName}`);
            return;
        }

        possibleSongs = possibleSongs.concat(SONG_DATABASE[groupName]);
    }

    currentSongPool = possibleSongs;

    remainingSongs = [...possibleSongs];

    selectedGroupsText.innerHTML = `Selected: <span style="color:#52ceff">${groupNames.join(", ")}</span>`;

    roundCount = 0;
    correctCount = 0;
    gaveUpCount = 0;

    artistOptions.style.display = "none";
    startScreen.style.display = "none";
    gameScreen.style.display = "block";

    clipLength = parseFloat(difficultySelect.value);

    startNextRound();
}

function startNextRound() {
    roundCount++;

    currentPreviewUrl = null;
    currentClipStart = null;

    guessesLeft = 3;

    if (remainingSongs.length === 0) {
        statusText.textContent =
            `Game complete! Final score: ${correctCount} correct, ${gaveUpCount} gave up.`;

        playBtn.style.display = "none";
        guessBtn.style.display = "none";
        guessInput.style.display = "none";
        giveUpBtn.style.display = "none";

        return;
    }

    const randomIndex =
        Math.floor(Math.random() * remainingSongs.length);

    currentSong = remainingSongs[randomIndex];

    remainingSongs.splice(randomIndex, 1);

    guessInput.value = "";

    playBtn.style.display = "inline-block";
    guessBtn.style.display = "inline-block";
    guessInput.style.display = "inline-block";
    giveUpBtn.style.display = "inline-block";

    updateScoreText();

    statusText.textContent =
        "Loading song...";

    loadJsonp(
        `https://itunes.apple.com/lookup?id=${currentSong.id}`,
        "handleSongLookup"
    );
}

function updateScoreText() {
    scoreText.innerHTML =
        `Songs remaining: ${remainingSongs.length+1}/${currentSongPool.length}
        <br><br>
        Round: <span style="color:#de69ff">${roundCount}</span>
        <br>
        Lives: <span style="color:#ff8fc7">${"♥".repeat(lives)}</span><span style="color:#000000">${"♥".repeat(5 - lives)}</span>
        <br>
        Guesses left this round: <span style="color:#52ceff">${"♥".repeat(guessesLeft)}</span><span style="color:#000000">${"♥".repeat(3 - guessesLeft)}</span>`;
}

function chooseNewClipStart(duration, previousStart) {
    const maxStart = duration - clipLength;

    let newStart = Math.random() * maxStart;

    if (previousStart === null) {
        return newStart;
    }

    while (Math.abs(newStart - previousStart) < 3) {
        newStart = Math.random() * maxStart;
    }

    return newStart;
}

function handleSongLookup(data) {
    const songData = data.results[0];
    currentSong.artist = songData.artistName;

    if (!songData || !songData.previewUrl) {
        statusText.textContent =
            "No preview found for this song. Starting next round.";

        startNextRound();
        return;
    }

    currentPreviewUrl = songData.previewUrl;

    const tempAudio = new Audio(currentPreviewUrl);

    tempAudio.addEventListener("loadedmetadata", () => {
        currentClipStart = chooseNewClipStart(
            tempAudio.duration,
            null
        );

        statusText.textContent =
            "Song loaded. Press play.";

        console.log("Answer:", currentSong.title);
        console.log("Saved clip start:", currentClipStart);
    });
}

function playOneSecondClip() {
    if (!currentPreviewUrl || currentClipStart === null) {
        statusText.textContent = "Preview is still loading. Try again.";
        return;
    }

    const audio = new Audio(currentPreviewUrl);

    audio.addEventListener("loadedmetadata", () => {
        audio.currentTime = currentClipStart;
        audio.play();

        setTimeout(() => {
            audio.pause();
            audio.currentTime = currentClipStart;
        }, clipLength * 1000); // clip length
    });
}

function checkGuess() {
    const userGuess = normalizeText(guessInput.value);
    const acceptedAnswers = [
        currentSong.title,
        ...(currentSong.answers || [])
    ].map(answer => normalizeText(answer));

    if (acceptedAnswers.includes(userGuess)) {
        correctCount++;
        updateScoreText();

        statusText.textContent = `Correct! The song was "${currentSong.title}" by ${currentSong.artist}. Loading next round...`;
        
        setTimeout(startNextRound, 1000);
    } else {
        guessesLeft--;
        updateScoreText();

        if (guessesLeft <= 0) {
            lives--;
            gaveUpCount++;
            updateScoreText();

            if (lives <= 0) {
                statusText.textContent =
                    `Game over! You made it to round ${roundCount}. The last song was "${currentSong.title}" by ${currentSong.artist}. Press Start Over to play again.`;

                playBtn.style.display = "none";
                guessBtn.style.display = "none";
                guessInput.style.display = "none";
                giveUpBtn.style.display = "none";

                guessInput.value = "";
                return;
            }

            statusText.textContent =
                `Out of guesses! You lost a heart. The song was "${currentSong.title}" by ${currentSong.artist}. Loading next round...`;

            setTimeout(startNextRound, 1000);

            guessInput.value = "";
            return;
        }

        statusText.textContent =
            `Incorrect. ${guessesLeft} guess${guessesLeft === 1 ? "" : "es"} left this round. New clip chosen. Press play again.`;

        const tempAudio = new Audio(currentPreviewUrl);

        tempAudio.addEventListener("loadedmetadata", () => {
            currentClipStart = chooseNewClipStart(
                tempAudio.duration,
                currentClipStart
            );

            console.log("New clip start:", currentClipStart);
        });
    }
    guessInput.value = "";
}

function giveUp() {
    lives--;
    gaveUpCount++;
    updateScoreText();

    if (lives <= 0) {
        statusText.textContent =
            `Game over! You made it to round ${roundCount}. Final score: ${correctCount} correct. The last song was "${currentSong.title}" by ${currentSong.artist}.`;

        playBtn.style.display = "none";
        guessBtn.style.display = "none";
        guessInput.style.display = "none";
        giveUpBtn.style.display = "none";

        return;
    }

    statusText.textContent =
        `The answer was "${currentSong.title}" by ${currentSong.artist}. You lost a heart. Loading next round...`;

    setTimeout(startNextRound, 1000);
}

function resetGame() {
    currentSong = null;
    currentPreviewUrl = null;
    currentClipStart = null;
    currentSongPool = [];

    roundCount = 0;
    correctCount = 0;
    gaveUpCount = 0;

    groupInput.value = "";
    guessInput.value = "";

    startScreen.style.display = "block";
    gameScreen.style.display = "none";
    selectedGroupsText.textContent = "";
    artistOptions.style.display = "block";
}

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function loadJsonp(url, callbackName) {
    const script = document.createElement("script");
    script.src = `${url}&callback=${callbackName}`;
    document.body.appendChild(script);
}