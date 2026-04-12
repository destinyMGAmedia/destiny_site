# Adding Videos to Your Gallery

This guide will help you populate your Video Gallery with actual videos from your YouTube channel.

## 🎥 How to Get Video IDs from YouTube

### Step 1: Find Your Video

1. Go to your YouTube channel
2. Click on a video you want to add
3. Look at the URL in your browser

### Step 2: Copy the Video ID

The URL will look like:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

The **video ID** is the part after `v=`:
```
dQw4w9WgXcQ
```

## 📝 Adding Videos to Your Gallery

### Step 1: Open the Gallery File

Open: `src/pages/VideoGallery.jsx`

### Step 2: Find the recentVideos Array

Around line 9, you'll see:

```javascript
const recentVideos = [
  {
    id: "VIDEO_ID_1", // Replace with actual video IDs from your channel
    title: "Sunday Service - Latest Message",
    date: "Recent",
    category: "Sunday Services"
  },
  // ... more videos
]
```

### Step 3: Replace with Your Actual Videos

Replace each entry with your real video information:

```javascript
const recentVideos = [
  {
    id: "dQw4w9WgXcQ", // ✅ Your actual video ID
    title: "Sunday Service - Faith That Moves Mountains", // ✅ Your video title
    date: "Feb 4, 2025", // ✅ Actual date
    category: "Sunday Services" // ✅ Keep category
  },
  {
    id: "anotherVideoID",
    title: "Midweek Service - Walking in Purpose",
    date: "Jan 29, 2025",
    category: "Midweek Services"
  },
  // Add as many videos as you want!
]
```

### Step 4: Add More Videos

Simply copy and paste to add more:

```javascript
const recentVideos = [
  // ... existing videos ...
  {
    id: "newVideoID",
    title: "Your New Video Title",
    date: "Feb 11, 2025",
    category: "Sunday Services"
  },
]
```

## 🎯 Categories

Use these exact category names:
- `"Sunday Services"`
- `"Midweek Services"`
- `"Special Events"`
- `"Teachings"`

## 🖼️ Video Thumbnails

The gallery automatically fetches thumbnails from YouTube using the video ID:
- High quality thumbnail is loaded first
- Falls back to standard quality if not available
- No additional work needed!

## 📋 Example - Complete Setup

Here's a complete example with 9 videos:

```javascript
const recentVideos = [
  // Sunday Services
  {
    id: "abc123def45",
    title: "Sunday Service - The Power of Prayer",
    date: "Feb 11, 2025",
    category: "Sunday Services"
  },
  {
    id: "xyz789ghi01",
    title: "Sunday Service - Walking in Faith",
    date: "Feb 4, 2025",
    category: "Sunday Services"
  },
  {
    id: "mno234pqr56",
    title: "Sunday Service - God's Promises",
    date: "Jan 28, 2025",
    category: "Sunday Services"
  },
  
  // Midweek Services
  {
    id: "stu789vwx01",
    title: "Midweek - Bible Study on Romans",
    date: "Feb 7, 2025",
    category: "Midweek Services"
  },
  {
    id: "abc456def78",
    title: "Midweek - Prayer and Worship",
    date: "Jan 31, 2025",
    category: "Midweek Services"
  },
  
  // Special Events
  {
    id: "ghi901jkl23",
    title: "Annual Conference - Day 1",
    date: "Jan 20, 2025",
    category: "Special Events"
  },
  {
    id: "mno456pqr78",
    title: "Youth Conference Highlights",
    date: "Jan 15, 2025",
    category: "Special Events"
  },
  
  // Teachings
  {
    id: "stu901vwx23",
    title: "Leadership Training Session",
    date: "Feb 1, 2025",
    category: "Teachings"
  },
  {
    id: "yza234bcd56",
    title: "Understanding Your Destiny",
    date: "Jan 25, 2025",
    category: "Teachings"
  },
]
```

## 🔄 Updating Videos

### Adding New Videos

When you upload a new video to YouTube:

1. Get the video ID from the URL
2. Open `src/pages/VideoGallery.jsx`
3. Add a new entry at the top of the `recentVideos` array:

```javascript
const recentVideos = [
  {
    id: "your-new-video-id",
    title: "Sunday Service - New Message",
    date: "Feb 18, 2025",
    category: "Sunday Services"
  },
  // ... existing videos ...
]
```

4. Save and the video will appear in your gallery!

### Removing Old Videos

Simply delete the video entry from the array.

## 💡 Pro Tips

1. **Keep it organized** - Add newest videos at the top
2. **Use clear titles** - Help visitors know what they're watching
3. **Add 10-20 videos** - Good balance between variety and manageability
4. **Update regularly** - Add new videos after each service
5. **Use categories wisely** - Makes it easy for visitors to find what they want

## 🎬 How the Gallery Works

1. **Main Player (Top)** - Shows selected video in large player
2. **Category Filters** - Click to filter by category (All, Sunday Services, etc.)
3. **Video Grid** - Clickable video cards with thumbnails
4. **Click a Video** - Loads in main player and scrolls to top
5. **Purple Ring** - Shows which video is currently playing

## 🚀 Testing

After adding your video IDs:

1. Save the file
2. Refresh http://localhost:5173/video-gallery
3. You should see:
   - Thumbnails for each video
   - Play button overlay
   - Video titles and dates
   - Working category filters
4. Click a video - it should load in the main player at the top!

## ❓ Troubleshooting

**Issue:** Thumbnail not showing  
**Solution:** The video might be private or unlisted. Make sure it's public.

**Issue:** Wrong thumbnail  
**Solution:** YouTube thumbnail might not be generated yet. Wait a few minutes after upload.

**Issue:** Can't click video  
**Solution:** Check that the video ID is correct (no spaces, exact match from URL).

---

**Need Help?** All the code is in `src/pages/VideoGallery.jsx` - check the comments for guidance!

