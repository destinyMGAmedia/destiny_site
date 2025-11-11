// === CONFIG ===
const YOUTUBE_API_KEY = "AIzaSyC8ydpQZ9WthqsIoiAhnyzjA8yt1OBRxE4";
const CHANNEL_ID = "UCH3uj1-ubXiKKhj4WZskflw";
let currentLiveId = null;
let viewerUpdateInterval;

// === ELEMENTS ===
const player = document.getElementById("youtube-player");
const offlineMsg = document.getElementById("offline-countdown");
const countdownEl = document.getElementById("countdown");
const viewerCountEl = document.getElementById("viewer-count");
const viewerNumberEl = document.getElementById("viewer-number");
const mobileChat = document.getElementById("mobile-chat-sheet");
const closeSheet = document.querySelector(".close-sheet");
const openChatFab = document.getElementById("open-chat-fab");
const videoSection = document.querySelector(".video-section");

// === CHECK LIVE STATUS ===
async function checkLiveStatus() {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      currentLiveId = data.items[0].id.videoId;

      // === Update player ===
      player.src = `https://www.youtube.com/embed/${currentLiveId}?autoplay=1&mute=0&rel=0&modestbranding=1`;
      player.style.display = "block";
      offlineMsg.style.display = "none";
      viewerCountEl.style.display = "flex";

      // === Update chat embeds ===
      const chatDomain = window.location.hostname;
      const chatUrl = `https://www.youtube.com/live_chat?v=${currentLiveId}&embed_domain=${chatDomain}`;

      const desktopChat = document.getElementById("desktop-chat");
      const mobileChatIframe = document.getElementById("mobile-chat");

      if (desktopChat) desktopChat.src = chatUrl;
      if (mobileChatIframe) mobileChatIframe.src = chatUrl;

      if (viewerUpdateInterval) clearInterval(viewerUpdateInterval);
      updateViewerCount();
      viewerUpdateInterval = setInterval(updateViewerCount, 30000);
    } else {
      setOfflineState();
    }
  } catch (err) {
    console.error("API Error:", err);
    setOfflineState();
  }
}

function setOfflineState() {
  player.style.display = "none";
  offlineMsg.style.display = "block";
  viewerCountEl.style.display = "none";
  if (viewerUpdateInterval) clearInterval(viewerUpdateInterval);
  startCountdown();
}

// === VIEWER COUNT ===
async function updateViewerCount() {
  if (!currentLiveId) return;
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${currentLiveId}&fields=items/liveStreamingDetails/concurrentViewers&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    const viewers =
      data.items?.[0]?.liveStreamingDetails?.concurrentViewers ?? 0;
    viewerNumberEl.textContent = viewers
      ? viewers.toLocaleString()
      : "Live stream not started";
  } catch (err) {
    console.error("Viewer fetch error:", err);
    viewerNumberEl.textContent = "Error loading viewers";
  }
}

// === COUNTDOWN TO NEXT SUNDAY 9AM WAT ===
const countdownEl = document.getElementById("countdown");
const offlineMsg = document.getElementById("offline-countdown");

// Function: Get next Sunday 9 AM WAT in local time
function getNextSunday9amWAT() {
  const now = new Date();

  // Adjust current time to WAT (UTC+1)
  const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const watOffset = 1 * 60 * 60000;
  const watNow = new Date(utcNow.getTime() + watOffset);

  // Compute next Sunday 9 AM (WAT)
  const nextSunday = new Date(watNow);
  nextSunday.setDate(watNow.getDate() + ((7 - watNow.getDay()) % 7));
  nextSunday.setHours(9, 0, 0, 0);

  // If already past 9 AM this Sunday, push to next week
  if (watNow.getDay() === 0 && watNow.getHours() >= 9) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  }

  // Convert back to local timezone
  return new Date(nextSunday.getTime() - watOffset);
}

// Function: Display next service date nicely
function formatServiceDate(date) {
  const options = { weekday: "long", month: "long", day: "numeric" };
  const formatted = date.toLocaleDateString("en-US", options);
  return `${formatted} – 9:00 AM WAT`;
}

// Countdown logic
function startCountdown() {
  const nextServiceDate = getNextSunday9amWAT();

  // Show full date in the offline message section
  const serviceTextEl = offlineMsg.querySelector("p strong");
  if (serviceTextEl) {
    serviceTextEl.textContent = formatServiceDate(nextServiceDate);
  }

  function update() {
    const now = new Date();
    let target = getNextSunday9amWAT();
    let diff = target - now;

    // When service is live
    if (diff <= 0) {
      countdownEl.textContent = "🔴 Service is LIVE!";
      const endTime = new Date(target.getTime() + 2 * 60 * 60 * 1000); // 2-hour duration
      if (now >= endTime) {
        target = getNextSunday9amWAT(); // Reset after service
      }
      return;
    }

    // Calculate remaining time
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    countdownEl.textContent = `${d}d ${h}h ${m}m ${s}s`;
  }

  update();
  setInterval(update, 1000);
}

startCountdown();


// === MOBILE CHAT ===
function setupMobileChat() {
  if (openChatFab) {
    openChatFab.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileChat.classList.add("open");
    });
  }
  if (closeSheet) {
    closeSheet.addEventListener("click", () =>
      mobileChat.classList.remove("open")
    );
  }
  mobileChat.addEventListener("click", (e) => {
    if (e.target === mobileChat) {
      mobileChat.classList.remove("open");
    }
  });
}

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  checkLiveStatus();
  setupMobileChat();
  startCountdown();
});
