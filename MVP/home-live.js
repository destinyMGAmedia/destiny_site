const YOUTUBE_API_KEY = "AIzaSyC8ydpQZ9WthqsIoiAhnyzjA8yt1OBRxE4";
  const CHANNEL_ID = "UCH3uj1-ubXiKKhj4WZskflw";

  const homePlayer = document.querySelector("#live iframe");
  const offlineText = document.querySelector("#live .offline");

  async function loadHomeLive() {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
      );
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const liveId = data.items[0].id.videoId;
        homePlayer.src = `https://www.youtube.com/embed/${liveId}?autoplay=1&mute=0&rel=0&modestbranding=1`;
        offlineText.style.display = "none";
      } else {
        offlineText.style.display = "block";
      }
    } catch (err) {
      console.error("Live check failed:", err);
      offlineText.style.display = "block";
    }
  }

  document.addEventListener("DOMContentLoaded", loadHomeLive);