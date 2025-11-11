// === CONFIG ===
const YOUTUBE_API_KEY = "AIzaSyC8ydpQZ9WthqsIoiAhnyzjA8yt1OBRxE4";
const CHANNEL_ID = "UCH3uj1-ubXiKKhj4WZskflw";
const PLAYLIST_ID = "YOUR_PLAYLIST_ID_HERE";
let currentLiveId = null;

// === ELEMENTS ===
const liveTitle = document.querySelector(".live-title");
const liveStatus = document.querySelector(".live-status");
const player = document.getElementById("youtube-player");
const videoWrapper = document.querySelector(".video-wrapper");
const viewerSection = document.getElementById("viewer-count");
const viewerNumber = document.getElementById("viewer-number");
const countdownBox = document.createElement("div");
countdownBox.className = "countdown";
videoWrapper.appendChild(countdownBox);

// === FETCH LIVE STREAM ===
async function fetchLiveStream() {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      const liveVideo = data.items[0];
      currentLiveId = liveVideo.id.videoId;

      liveTitle.textContent = `Sunday Service – ${liveVideo.snippet.title}`;
      updateStreamStatus(true);
      updateYouTubeDisplay(true, currentLiveId);
      fetchViewerCount(currentLiveId);
    } else {
      liveTitle.textContent = "Sunday Service – No live stream currently";
      updateStreamStatus(false);
      updateYouTubeDisplay(false);
      viewerSection.hidden = true;
    }
  } catch (error) {
    console.error("Error fetching live stream:", error);
    liveTitle.textContent = "Sunday Service – Unable to load stream";
    updateYouTubeDisplay(false);
  }
}

// === STREAM STATUS (UPDATES EVERY MINUTE) ===
function updateStreamStatus(hasLiveStream = false) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wat = new Date(utc + 3600000);
  const day = wat.getDay();
  const hour = wat.getHours();
  const minute = wat.getMinutes();

  if (day === 0 && hour >= 9 && (hour < 12 || (hour === 12 && minute <= 45))) {
    liveStatus.textContent = hasLiveStream
      ? "Sunday Service – Live Now"
      : "Sunday Service – Live soon";
  } else {
    const nextSunday = new Date(wat);
    nextSunday.setDate(wat.getDate() + ((7 - day) % 7 || 7));
    nextSunday.setHours(9, 0, 0, 0);
    const dateStr = nextSunday.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    liveStatus.textContent = `Next Stream – ${dateStr}`;
  }
}

// === VIEWER COUNT ===
async function fetchViewerCount(videoId) {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      const details = data.items[0].liveStreamingDetails;
      if (details.concurrentViewers) {
        viewerNumber.textContent = details.concurrentViewers;
        viewerSection.hidden = false;
      } else {
        viewerSection.hidden = true;
      }
    } else {
      viewerSection.hidden = true;
    }
  } catch (err) {
    console.error("Error fetching viewers:", err);
    viewerSection.hidden = true;
  }
}

// === HANDLE YOUTUBE DISPLAY ===
async function updateYouTubeDisplay(hasLiveStream = false, liveVideoId = null) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wat = new Date(utc + 3600000);
  const day = wat.getDay();
  const hour = wat.getHours();
  const minute = wat.getMinutes();

  countdownBox.style.display = "none";
  player.style.display = "block";

  // 1️⃣ Sunday during service hours
  if (
    day === 0 &&
    (hour > 9 || (hour === 9 && minute >= 0)) &&
    (hour < 12 || (hour === 12 && minute <= 45))
  ) {
    if (hasLiveStream && liveVideoId) {
      player.src = `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=0&rel=0&modestbranding=1`;
    } else {
      showMessage("Sunday Service", "Live soon – please check back shortly");
    }
  }

  // 2️⃣ Sunday after 12:45 pm
  else if (day === 0 && (hour > 12 || (hour === 12 && minute > 45))) {
    const lastVideoId = await fetchLastStreamVideo();
    if (lastVideoId) {
      player.src = `https://www.youtube.com/embed/${lastVideoId}?autoplay=1&mute=0&rel=0&modestbranding=1`;
    } else {
      showCountdown();
    }
  }

  // 3️⃣ Any other day
  else {
    showCountdown();
  }
}

// === COUNTDOWN & MESSAGE HELPERS ===
function showMessage(title, msg) {
  countdownBox.innerHTML = `<h3>${title}</h3><p>${msg}</p>`;
  countdownBox.style.display = "block";
  player.style.display = "none";
}

function showCountdown() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wat = new Date(utc + 3600000);
  const nextSunday = new Date(wat);
  const day = wat.getDay();
  nextSunday.setDate(wat.getDate() + ((7 - day) % 7 || 7));
  nextSunday.setHours(9, 0, 0, 0);

  function updateCountdown() {
    const diff = nextSunday - new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 + 3600000);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    countdownBox.innerHTML = `
    <div class="countdown">
      <h3>Next Sunday Service</h3>
      <p>Stream starts in ${days}d ${hours}h ${minutes}m ${seconds}s</p>
    </div>
    `;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  countdownBox.style.display = "block";
  player.style.display = "none";
}

// === FETCH LAST STREAM ===
async function fetchLastStreamVideo() {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=${PLAYLIST_ID}&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    if (data.items?.length) return data.items[0].snippet.resourceId.videoId;
  } catch (err) {
    console.error("Error fetching last stream:", err);
  }
  return null;
}

const toggleButton = document.getElementById("toggle-past-sermons");
const pastSermonsSection = document.getElementById("past-sermons-section");
const pastSermonsList = document.getElementById("past-sermons-list");

toggleButton.addEventListener("click", async () => {
  pastSermonsSection.classList.toggle("visible");

  // If section is opening and empty, load the videos
  if (pastSermonsSection.classList.contains("visible") && pastSermonsList.children.length === 0) {
    await loadPastSermons();
  }
});

async function loadPastSermons() {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=6&playlistId=${PLAYLIST_ID}&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      pastSermonsList.innerHTML = data.items
        .map(
          (item) => `
          <div class="sermon-item" onclick="playPastSermon('${item.snippet.resourceId.videoId}')">
            <iframe
              src="https://www.youtube.com/embed/${item.snippet.resourceId.videoId}?rel=0&modestbranding=1"
              allowfullscreen
            ></iframe>
            <p class="sermon-title">${item.snippet.title}</p>
          </div>
        `
        )
        .join("");
    } else {
      pastSermonsList.innerHTML = `<p>No past sermons found.</p>`;
    }
  } catch (error) {
    console.error("Error fetching past sermons:", error);
    pastSermonsList.innerHTML = `<p>Unable to load sermons at the moment.</p>`;
  }
}

// === Function to play a selected sermon in the main video player ===
function playPastSermon(videoId) {
  const mainPlayer = document.getElementById("youtube-player");
  if (mainPlayer) {
    mainPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1`;
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to the player
  }
}


const chatFab = document.getElementById('open-chat-fab');
  const chatSheet = document.getElementById('mobile-chat-sheet');
  const closeSheet = document.querySelector('.close-sheet');
  const tabs = document.querySelectorAll('.chat-tab');
  const liveChat = document.getElementById('live-chat');
  const comments = document.getElementById('comments-chat');

  // Open the chat sheet
  chatFab.addEventListener('click', () => {
    chatSheet.classList.add('active');
  });

  // Close the chat sheet
  closeSheet.addEventListener('click', () => {
    chatSheet.classList.remove('active');
  });

  // Switch between live chat and comments
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (tab.dataset.target === 'live') {
        liveChat.style.display = 'block';
        comments.style.display = 'none';
      } else {
        liveChat.style.display = 'none';
        comments.style.display = 'flex';
      }
    });
  });

  // Comment sending simulation
  const sendBtn = document.getElementById('send-comment');
  const commentText = document.getElementById('comment-text');
  const messages = document.querySelector('.messages');

  sendBtn.addEventListener('click', () => {
    const text = commentText.value.trim();
    if (text !== '') {
      const msg = document.createElement('p');
      msg.textContent = text;
      msg.style.background = '#f1f1f1';
      msg.style.padding = '10px';
      msg.style.borderRadius = '10px';
      msg.style.marginBottom = '8px';
      messages.appendChild(msg);
      commentText.value = '';
      messages.scrollTop = messages.scrollHeight;
    }
  });


// === INIT ===
fetchLiveStream();
setInterval(fetchLiveStream, 120000); // check every 2 minutes
