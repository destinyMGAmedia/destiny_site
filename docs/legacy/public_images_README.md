# Church Images Directory

## Adding Your Church Image to the Hero Section

To add your church's photo to the home page hero section:

### Step 1: Add Your Image

1. Place your church image in this directory: `public/images/`
2. Recommended name: `church-hero.jpg` or `church-hero.png`
3. **Recommended size:** At least 1920x1080px for best quality
4. **Format:** JPG, PNG, or WebP

### Step 2: Update Home Page

Open `src/pages/Home.jsx` and find the hero section (around line 12):

**Current (placeholder):**
```jsx
<div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-gray-900">
  {/* Add your church image here: <img src="/path-to-church-image.jpg" className="w-full h-full object-cover" alt="Church" /> */}
</div>
```

**Replace with:**
```jsx
<img 
  src="/images/church-hero.jpg" 
  className="w-full h-full object-cover" 
  alt="Destiny Mission Global Assembly Church Building" 
/>
```

### Step 3: Save and Test

1. Save the file
2. Refresh your browser
3. The church image should now appear as the hero background!

---

## Image Tips

### Best Practices
- ✅ Use high-resolution images (min 1920x1080px)
- ✅ Landscape orientation works best
- ✅ Compress images to reduce load time (use TinyPNG.com)
- ✅ Use JPG for photos, PNG for graphics with transparency

### Image Position
The image uses `object-cover` which means:
- It fills the entire hero section
- Maintains aspect ratio
- Centers the image automatically

### If Your Image is Too Bright
The overlay (`bg-gradient-to-r from-black/70...`) makes text readable. To adjust:
- Increase darkness: Change `from-black/70` to `from-black/80` or `from-black/90`
- Decrease darkness: Change `from-black/70` to `from-black/60` or `from-black/50`

---

## Other Images You Might Want to Add

Consider adding images for:
- `/images/about-hero.jpg` - About page header
- `/images/assemblies/` - Photos of each church branch
- `/images/events/` - Special event photos
- `/images/logo.png` - Church logo for navbar

To use the logo in the navbar, uncomment the logo line in `src/components/Navbar.jsx`.

