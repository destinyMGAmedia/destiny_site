# YouTube Live Streaming Setup Guide

This guide will help you configure the YouTube live streaming and video gallery features on your website.

## 📺 Quick Setup

The Gallery page and Home page live preview are already created and integrated into your website. You just need to add your YouTube channel ID and playlist IDs.

## 🔑 Step 1: Find Your YouTube Channel ID

### Method 1: From YouTube Studio (Easiest)

1. Go to [YouTube Studio](https://studio.youtube.com)
2. Click **Settings** (gear icon in the left sidebar)
3. Click **Channel** → **Advanced settings**
4. Copy your **Channel ID**
   - It looks like: `UCxxxxxxxxxxxxxxxxxxxxxx`

### Method 2: From Your Channel URL

1. Go to your YouTube channel
2. Look at the URL in your browser:
   - **If it shows:** `youtube.com/channel/UCxxxxx...` 
     - Copy the `UCxxxxx...` part (that's your Channel ID)
   - **If it shows:** `youtube.com/@YourChannelName`
     - You can use `@YourChannelName` as your channel ID
     - OR follow Method 1 to get the UC... format

### Method 3: From Channel Page Source

1. Go to your YouTube channel page
2. Right-click → **View Page Source**
3. Press `Ctrl+F` (or `Cmd+F` on Mac)
4. Search for: `"channelId"` or `"externalId"`
5. Copy the ID that appears (format: `UCxxxxx...`)

## 🛠️ Step 2: Update Your Website

### Open Both Files That Need Channel ID

You need to update **two files**:
1. `src/pages/Gallery.jsx` (Video gallery page)
2. `src/pages/Home.jsx` (Home page live preview)

### Find and Replace the Placeholder

In **both files**, look for this line (around line 3):
```javascript
const YOUTUBE_CHANNEL_ID = "YOUR_CHANNEL_ID_HERE"
```

Replace `"YOUR_CHANNEL_ID_HERE"` with your actual channel ID in both files:

**Example:**
```javascript
// Before:
const YOUTUBE_CHANNEL_ID = "YOUR_CHANNEL_ID_HERE"

// After:
const YOUTUBE_CHANNEL_ID = "UCa1b2c3d4e5f6g7h8i9j0k"
// OR
const YOUTUBE_CHANNEL_ID = "@DestinyMissionGA"
```

### Save the Files

Save both files after updating the channel ID.

## 📋 Step 3: Create YouTube Playlists (For Gallery Categories)

The Gallery page organizes videos into categories using YouTube playlists.

### Create Playlists on YouTube

1. Go to [YouTube Studio](https://studio.youtube.com)
2. Click **Playlists** in the left sidebar
3. Click **NEW PLAYLIST**
4. Create these playlists:
   - **Sunday Services** - For weekly Sunday worship
   - **Midweek Services** - For Wednesday Bible studies
   - **Special Events** - For conferences, revivals, etc.
   - **Teachings & Sermons** - For in-depth teachings

### Get Playlist IDs

1. Open each playlist in YouTube Studio
2. Look at the URL: `youtube.com/playlist?list=PLxxxxxxxxxxxxxx`
3. Copy the `PLxxxxxxxxxxxxxx` part (that's your Playlist ID)

### Add Playlist IDs to Gallery Page

Open `src/pages/Gallery.jsx` and find the `videoCategories` array (around line 7):

```javascript
const videoCategories = [
  {
    name: "Sunday Services",
    playlistId: "PLxxxxxxxxxxxxxx",  // Replace with your Sunday playlist ID
    description: "Weekly Sunday worship services",
    icon: "⛪"
  },
  {
    name: "Midweek Services",
    playlistId: "PLyyyyyyyyyyyyyy",  // Replace with your Midweek playlist ID
    description: "Wednesday Bible study and worship",
    icon: "📖"
  },
  {
    name: "Special Events",
    playlistId: "PLzzzzzzzzzzzzzz",  // Replace with your Events playlist ID
    description: "Conferences, revivals, and special meetings",
    icon: "✨"
  },
  {
    name: "Teachings & Sermons",
    playlistId: "PLaaaaaaaaaaaaaaa",  // Replace with your Teachings playlist ID
    description: "In-depth Bible teachings and messages",
    icon: "🎓"
  }
]
```

Replace each `playlistId` value with your actual playlist IDs.

### Save the File

Save `src/pages/Gallery.jsx` and your video gallery will be fully functional!

## 🎥 How It Works

### Two-Page Video System

Your website now has a smart two-page video system:

#### **Home Page** (`/`)
- Small **live stream preview**
- Quick access to current live service
- "Go to Video Gallery" button
- Non-overwhelming, welcoming layout

#### **Gallery Page** (`/gallery`)
- **Large video player** for optimal viewing
- Toggle between Live Stream and Video Categories
- Click any category to load playlist in main player
- Auto-scrolls to player when category selected
- Visual indicator shows selected category

### Automatic Live/Replay Behavior

The live stream embed automatically:
- ✅ Shows your **live stream** when you're broadcasting
- ✅ Shows your **most recent video** when offline
- ✅ Updates in real-time without manual changes
- ✅ No code changes needed - just go live on YouTube!

### Playlist Category System

When users click a category on the Gallery page:
1. The large player loads that playlist
2. Page scrolls to top to show the video
3. Category button highlights to show selection
4. Users can browse all videos in that category
5. Can switch between categories anytime

## 🎯 Alternative: Using Specific Video IDs

If you prefer to embed a specific scheduled live stream (when you know the video ID in advance):

### 1. Schedule Your Live Stream on YouTube

1. Go to YouTube Studio
2. Click **Create** → **Go Live**
3. Schedule your stream
4. Copy the **Video ID** from the URL (looks like: `dQw4w9WgXcQ`)

### 2. Update Your Code

In `src/pages/WatchLive.jsx`, change the embed URL to:

```javascript
// Instead of the channel live_stream URL, use:
const UPCOMING_STREAM_ID = "dQw4w9WgXcQ"  // Your video ID
const youtubeEmbedUrl = `https://www.youtube.com/embed/${UPCOMING_STREAM_ID}`
```

**Note:** This shows the specific video only. To return to auto-live behavior, switch back to the `live_stream?channel=` format.

## 📋 Testing Your Setup

### Before Going Live

1. Save all your changes with channel ID and playlist IDs
2. Start your development server: `npm run dev`
3. Test both pages:
   - Navigate to `http://localhost:5173/` - Check live preview
   - Navigate to `http://localhost:5173/gallery` - Check main player and categories
4. You should see:
   - Your latest uploaded video (if not currently live)
   - OR your live stream (if currently streaming)
5. Click each category button to verify playlists load correctly

### When You Go Live

1. Start your live stream on YouTube as normal
2. Your website will **automatically** show the live stream
3. No code changes needed!

## 🔴 During Service Times

Your viewers can:
- ✅ Watch live preview on Home page (`/`)
- ✅ Click "Go to Video Gallery" for full-screen experience (`/gallery`)
- ✅ Participate in YouTube live chat
- ✅ Click "Subscribe on YouTube" button
- ✅ Switch between website and YouTube seamlessly
- ✅ Browse past services while stream plays

## 📱 Features Included

### On Your Website

**Home Page:**
- Live stream preview (medium size)
- Service times display
- Quick navigation to Gallery
- Clean, welcoming layout

**Gallery Page:**
- Large video player for optimal viewing
- 4 organized categories
- Live/Categories toggle
- Visual category selection
- Smooth scrolling
- Subscribe to YouTube CTA

### YouTube Features Still Work
- Live chat
- Super Chat / donations
- Subscriber notifications
- YouTube app integration
- Mobile-friendly

## ⚙️ Customization Options

### Update Service Times

In `src/pages/WatchLive.jsx`, find the "We Stream Live" section and update:

```javascript
<div>
  <p className="font-semibold text-white">Sunday Service</p>
  <p>Every Sunday at 9:00 AM</p>  {/* Update time here */}
</div>
```

### Change Button Colors

The "Watch on YouTube" button uses YouTube's red color (`bg-red-600`). To customize, modify the button styling in the file.

## 🚨 Troubleshooting

### Video Not Showing

**Problem:** Blank player or error message

**Solutions:**
1. Verify your channel ID is correct (check for typos)
2. Ensure your channel has at least one public video
3. Check that your live streams are set to "Public" not "Unlisted" or "Private"

### Wrong Video Showing

**Problem:** Old video showing instead of live stream

**Solutions:**
1. Confirm you're actually live on YouTube
2. Check your stream is set to "Public"
3. Try refreshing the page (Ctrl+F5 or Cmd+Shift+R)
4. Clear browser cache

### Can't Find Channel ID

**Solution:** Use your channel handle with @ symbol:
```javascript
const YOUTUBE_CHANNEL_ID = "@YourChannelHandle"
```

## 📊 Analytics

YouTube analytics will track:
- Views from your website embed
- Watch time
- Engagement (likes, comments, shares)
- Traffic sources (your website will show as a referral)

Access analytics in [YouTube Studio](https://studio.youtube.com) → **Analytics**.

## 🎓 Going Live Checklist

Before your first live stream:

- [ ] YouTube channel ID added to `WatchLive.jsx`
- [ ] Test the `/watch-live` page
- [ ] Schedule your first live stream on YouTube
- [ ] Set stream to "Public"
- [ ] Test streaming from YouTube (do a private test if needed)
- [ ] Announce to your congregation about the Watch Live page
- [ ] Consider promoting the URL on social media

## 🔗 Useful Links

- [YouTube Studio](https://studio.youtube.com)
- [YouTube Live Dashboard](https://studio.youtube.com/channel/UC/livestreaming)
- [YouTube Creator Academy - Live Streaming](https://creatoracademy.youtube.com/page/topic/live-streaming)

## 💡 Pro Tips

1. **Schedule streams in advance** - This builds anticipation and sends notifications to subscribers
2. **Use Stream Announcements** - YouTube's community tab to announce upcoming streams
3. **Test your setup** - Do a private test stream before your first public service
4. **Promote the website** - Tell congregation to bookmark `/watch-live`
5. **Archive services** - Keep streams as VODs (Videos on Demand) for replay

---

**Need Help?** Check the comments in `src/pages/WatchLive.jsx` for additional guidance.

**Last Updated:** January 2025

