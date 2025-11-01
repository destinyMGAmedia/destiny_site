# Design Guide - Destiny Mission Global Assembly Website

## 🎨 Color Scheme

The website now uses a professional purple, gray, and white color palette:

### Primary Colors
- **Purple 900** (`#581c87`) - Headers, primary buttons, navbar (non-scrolled)
- **Purple 600** (`#9333ea`) - Accent elements, CTAs, active states
- **Purple 400** (`#c084fc`) - Dividers, highlights
- **Purple 200** (`#e9d5ff`) - Light text on dark backgrounds

### Neutral Colors
- **White** (`#ffffff`) - Card backgrounds, button text, clean sections
- **Gray 900** (`#111827`) - Footer background
- **Gray 700** (`#374151`) - Body text
- **Gray 100** (`#f3f4f6`) - Alternate section backgrounds
- **Gray 50** (`#f9fafb`) - Card backgrounds, main background

### Usage Guidelines

**Purple** - Use for:
- Primary headers and titles
- Call-to-action buttons
- Navigation elements
- Church branding elements
- Active states and highlights

**White** - Use for:
- Card and section backgrounds
- Button text on colored backgrounds
- Clean, modern sections
- Contrast against dark elements

**Gray** - Use for:
- Body text and descriptions
- Alternate section backgrounds
- Form inputs
- Subtle UI elements

## 🖼️ Adding Your Church Image

### Hero Section Background

The home page hero section is designed to showcase a large church image with text overlay on the left side.

#### Current Setup (Placeholder)
```jsx
<div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-gray-900">
  {/* Add your church image here */}
</div>
```

#### To Add Your Church Photo:

1. **Prepare Your Image:**
   - Recommended size: 1920x1080px or larger
   - Format: JPG or PNG
   - Name it: `church-hero.jpg`
   - Place it in: `public/images/church-hero.jpg`

2. **Update Home.jsx:**
   
   Open `src/pages/Home.jsx` and find line ~12, replace:
   ```jsx
   <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-gray-900">
     {/* Add your church image here: <img src="/path-to-church-image.jpg" className="w-full h-full object-cover" alt="Church" /> */}
   </div>
   ```
   
   With:
   ```jsx
   <img 
     src="/images/church-hero.jpg" 
     className="w-full h-full object-cover" 
     alt="Destiny Mission Global Assembly Church Building" 
   />
   ```

3. **Save and Refresh** - Your church image will now appear!

### Image Overlay

The dark gradient overlay ensures text is always readable:
```jsx
<div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
```

**Adjust darkness if needed:**
- Darker: Change `from-black/70` to `from-black/80` or `from-black/90`
- Lighter: Change `from-black/70` to `from-black/60` or `from-black/50`

## 📐 Layout Structure

### Section Backgrounds (Alternating Pattern)

The website uses alternating backgrounds for visual interest:

```
Home Page:
├── Hero Section: Purple gradient with image
├── Welcome: White background
├── Service Times: Gray 100 background
├── Live Stream: White background
├── Prayer & Testimonies: Gray 100 background
└── CTA: Purple 900 background

Other Pages:
├── Header: Purple 900 background
├── Section 1: White background
├── Section 2: Gray 100 background
├── Section 3: White background
└── CTA/Footer: Purple 900/Gray 900 background
```

This creates a clean, modern flow throughout the site.

## 🔤 Typography

### Headings
- **H1 (Page Titles):** `text-4xl md:text-6xl font-bold`
- **H2 (Section Titles):** `text-4xl md:text-5xl font-bold`
- **H3 (Card Titles):** `text-2xl font-bold`

### Body Text
- **Primary:** `text-lg text-gray-700`
- **Secondary:** `text-gray-600`
- **Light (on dark):** `text-purple-200` or `text-gray-200`

### Accent Dividers
All section dividers use:
```jsx
<div className="h-1 w-24 bg-purple-600 mx-auto mb-12"></div>
```

## 🎯 Component Patterns

### Cards - Light Background
```jsx
<div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition duration-300">
  {/* content */}
</div>
```

### Cards - With Purple Accent
```jsx
<div className="bg-gray-50 rounded-xl p-8 shadow-lg border-l-4 border-purple-600">
  {/* content */}
</div>
```

### Primary Buttons
```jsx
<button className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition duration-300 shadow-lg">
  Button Text
</button>
```

### Secondary Buttons (White on Purple)
```jsx
<button className="px-8 py-4 bg-white text-purple-900 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg">
  Button Text
</button>
```

## 🔝 Navigation

### Fixed Navbar Behavior

**When Not Scrolled (at top of page):**
- Background: Purple 900 with transparency
- Logo/Text: White
- Links: Purple 100 / White
- Modern, prominent appearance

**When Scrolled:**
- Background: White with shadow
- Logo/Text: Purple 900
- Links: Gray 700 / Purple 900
- Clean, professional appearance

This creates a dynamic navigation that adapts to page position.

## 📱 Responsive Design

All components are fully responsive with breakpoints:
- **Mobile:** Default styles
- **Tablet (md):** `md:` prefix (768px+)
- **Desktop (lg):** `lg:` prefix (1024px+)

## ✨ Hover Effects

All interactive elements include hover effects:
- **Cards:** `hover:shadow-xl`
- **Buttons:** `hover:bg-purple-700` + `transform hover:scale-105`
- **Links:** `hover:text-purple-800`

## 🎭 Glass Morphism (Removed)

The old blue/indigo glass-morphism effects have been replaced with:
- Clean white cards
- Subtle shadows
- Professional gray backgrounds
- Crisp purple accents

This creates a more professional, "classy" appearance suitable for a church website.

## 🖼️ Image Guidelines

### Recommended Images to Add

1. **Hero Image** - `public/images/church-hero.jpg` (1920x1080px)
2. **Church Logo** - `public/images/logo.png` (transparent PNG)
3. **Assembly Photos** - `public/images/assemblies/` (for each branch)
4. **Event Photos** - `public/images/events/` (for special events)

### Image Optimization
- Compress images with [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/)
- Target file size: Under 500KB for hero images
- Use modern formats: WebP when possible

## 🔄 Customizing Colors

To adjust the purple shades used throughout the site, you can modify Tailwind classes:

**Lighter Purple Theme:**
- Replace `bg-purple-900` with `bg-purple-800`
- Replace `bg-purple-600` with `bg-purple-500`

**Darker Purple Theme:**
- Replace `bg-purple-600` with `bg-purple-700`
- Add more `bg-purple-900` sections

**Custom Purple Shades:**
Edit `tailwind.config.js` to add custom purple colors:
```javascript
theme: {
  extend: {
    colors: {
      'church-purple': {
        light: '#e9d5ff',
        DEFAULT: '#9333ea',
        dark: '#581c87',
      }
    }
  }
}
```

## 📝 Maintenance

### When Adding New Content

1. **Maintain Color Consistency:**
   - Purple for primary elements
   - White/Gray for content areas
   - Dark purple for CTAs

2. **Use Established Patterns:**
   - Section headers with purple dividers
   - White cards with shadows
   - Purple buttons for primary actions

3. **Test on Multiple Devices:**
   - Mobile phone
   - Tablet
   - Desktop

## 🎨 Design Philosophy

This design emphasizes:
- ✅ **Professionalism** - Clean, modern aesthetic
- ✅ **Readability** - High contrast, clear typography
- ✅ **Brand Identity** - Consistent purple theme
- ✅ **User Experience** - Intuitive navigation, clear CTAs
- ✅ **Accessibility** - Good color contrast, large touch targets

---

**Questions?** Refer to specific component files for implementation examples.

