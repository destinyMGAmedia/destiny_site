# Destiny Mission Global Assembly Website

Official website for Destiny Mission Global Assembly - To bring people and places into their destiny in God and raise dynamic leaders.

## About

Destiny Mission Global Assembly is a vibrant community of believers committed to discovering and fulfilling God's purpose for their lives. This website serves as our online presence, providing information about our ministries, service times, and ways to connect with our church family.

## Features

- ⛪ Church information and mission
- 🙏 Multiple ministry pages
- 📅 Service times and events calendar
- 📱 Fully responsive design
- 🧭 React Router DOM for smooth navigation
- ✨ Modern, welcoming interface
- 🎨 Beautiful gradient design with spiritual aesthetics

## Tech Stack

- **React 18** - Modern UI library
- **React Router DOM** - Client-side routing
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - Cross-browser compatibility

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The site will be available at `http://localhost:5173`

### Build for Production

```bash
# Build optimized production bundle
npm run build
```

### Preview Production Build

```bash
# Preview the production build locally
npm run preview
```

## Project Structure

```
destiny_site/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable components
│   │   ├── Layout.jsx   # Main layout wrapper
│   │   ├── Navbar.jsx   # Navigation component
│   │   └── Footer.jsx   # Footer component
│   ├── pages/           # Page components
│   │   ├── Home.jsx     # Home page (includes Prayer & Testimonies)
│   │   ├── About.jsx    # About page
│   │   ├── Assemblies.jsx  # Church branches/assemblies
│   │   ├── Programmes.jsx  # Church programmes and schedule
│   │   ├── VideoGallery.jsx  # Video gallery with categories
│   │   └── Contact.jsx  # Contact page
│   ├── App.jsx          # Router configuration
│   ├── App.css          # Component styles
│   ├── index.css        # Global styles with Tailwind
│   └── main.jsx         # Application entry point
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
├── vite.config.js       # Vite configuration
└── README.md            # This file
```

## Pages

The website includes the following pages:

### 1. **Home** (`/`)

- Welcome hero section with church name and slogan
- Brief introduction to the church
- Service times
- **Live stream preview** with YouTube embed
- Quick link to Video Gallery
- **Prayer requests** section with email link
- **Testimonies** section with email link
- Call-to-action for visitors

### 2. **About** (`/about`)

- Mission statement
- Vision for the church
- Church declaration ("I am wonderfully made and dignified...")
- Core values (VIP LEAD: Vision, Integrity, Pioneering, Leadership, Excellence, Action, Devotion)
- Leadership information

### 3. **Assemblies** (`/assemblies`)

- Church branches and locations
- Contact information for each assembly
- Service times per location
- Pastor/leadership information
- Option to start new assemblies

### 4. **Programmes** (`/programmes`)

- Weekly schedule (Sunday & Midweek services)
- Church activities and ministries
  - Worship & Praise
  - Bible Study
  - Youth Ministry
  - Prayer & Intercession
  - Community Outreach
  - Discipleship
  - Children's, Women's & Men's Ministries
- Special events throughout the year

### 5. **Video Gallery** (`/video-gallery`)

- **Large video player** for main viewing
- **Video grid with thumbnails** - Click to select and watch
- Category filtering (All, Sunday Services, Midweek, Events, Teachings)
- Automatic YouTube thumbnail display
- Play button overlay on each video
- Visual indicator for currently playing video
- Responsive grid layout
- Subscribe to YouTube CTA
- **⚠️ Requires video IDs from your YouTube channel** - See [ADDING_VIDEOS.md](ADDING_VIDEOS.md)

### 6. **Contact** (`/contact`)

- Contact information (address, phone, email)
- Contact form with FormSubmit integration
- Office hours
- Location details

## Contact & Communication

This website uses simple email links and FormSubmit for communication:

- **Prayer Requests** → Direct email to `prayer@dmga.org`
- **Testimonies** → Direct email to `testimonies@dmga.org`
- **General Contact Form** → FormSubmit to `info@dmga.org`

### Contact Form Setup (FormSubmit)

**Important:** The Contact form requires FormSubmit activation:

1. Submit a test contact form at `/contact`
2. Check the `info@dmga.org` inbox
3. Click the activation link in the email from FormSubmit
4. Form will work immediately after activation

**Prayer & Testimonies** use simple mailto: links, no setup needed!

See [FORMSUBMIT_SETUP.md](FORMSUBMIT_SETUP.md) for detailed setup instructions.

### Features

- ✅ No backend required
- ✅ Spam protection (honeypot)
- ✅ Custom success messages
- ✅ Email notifications
- ✅ Easy to migrate to backend later

## YouTube Video Gallery Setup

The Video Gallery page (`/video-gallery`) and Home page live preview are ready to display your YouTube videos.

### ✅ Already Configured

**YouTube Channel ID:**  
`UCH3uj1-ubXiKKhj4WZskflw`

### 📹 Add Your Videos to the Gallery

The Video Gallery now displays a **grid of clickable video thumbnails**. To populate it with your actual videos:

1. Go to your YouTube channel
2. Copy video IDs from video URLs (the part after `v=`)
3. Open `src/pages/VideoGallery.jsx`
4. Update the `recentVideos` array with your video IDs and info
5. Save and your videos will appear in a beautiful grid!

**Example:**

```javascript
const recentVideos = [
  {
    id: "dQw4w9WgXcQ", // Your actual video ID
    title: "Sunday Service - Faith That Moves Mountains",
    date: "Feb 11, 2025",
    category: "Sunday Services",
  },
  // Add more videos...
];
```

See **[ADDING_VIDEOS.md](ADDING_VIDEOS.md)** for complete step-by-step instructions.

### How It Works

- ✅ Automatically shows live stream when you're broadcasting
- ✅ Shows latest video when offline
- ✅ Fully responsive video player
- ✅ YouTube features (chat, super chat) work seamlessly
- ✅ No manual updates needed - just go live on YouTube!

See [YOUTUBE_SETUP.md](YOUTUBE_SETUP.md) for complete setup instructions and troubleshooting.

## Routing

The application uses React Router DOM for client-side routing:

- **Layout Component**: Wraps all pages with consistent navigation and footer
- **Nested Routes**: All pages render within the Layout component
- **Active Link Highlighting**: Navigation shows active page
- **Mobile Responsive Menu**: Hamburger menu for mobile devices
- **Scroll Effect**: Navbar changes appearance on scroll

## Customization

### Update Content

Edit the page components in `src/pages/` to update content:

- `Home.jsx` - Hero section, welcome message, service times
- `About.jsx` - Mission, vision, values, leadership
- `Ministries.jsx` - Ministry descriptions and details
- `Events.jsx` - Event schedules and special events
- `Prayer.jsx` - Prayer form categories and messaging
- `Testimonies.jsx` - **Featured testimonies** (manually update from approved submissions)
- `Contact.jsx` - Contact information and form

#### Managing Testimonies

To add approved testimonies to the website:

1. Receive testimony via form submission to `testimonies@dmga.org`
2. Review and verify the testimony
3. Edit `src/pages/Testimonies.jsx`
4. Add new entry to the `featuredTestimonies` array:

```javascript
{
  name: "John D.",  // Use first name/initial or "Anonymous"
  testimony: "The testimony text here...",
  date: "February 2025"
}
```

5. Redeploy the website to show the new testimony

### Styling

- **Colors**: Modify gradient colors in components (currently blue-purple theme)
- **Tailwind Config**: Edit `tailwind.config.js` for theme customization
- **Custom CSS**: Add custom styles in `src/App.css`

### Navigation

Update navigation links in `src/components/Navbar.jsx`:

```javascript
const navLinks = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  // Add more routes here
];
```

### Adding New Pages

1. Create a new component in `src/pages/`
2. Import it in `src/App.jsx`
3. Add a new Route in the Routes configuration
4. Update the Navbar links if needed

## Deployment

This site can be deployed to various platforms:

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Netlify

1. Connect your Git repository
2. Build command: `npm run build`
3. Publish directory: `dist`

### GitHub Pages

```bash
npm install -g gh-pages
npm run build
gh-pages -d dist
```

### Other Static Hosting

After running `npm run build`, deploy the `dist` folder to any static hosting service.

## Contact

For questions about the website or church:

- Email: info@dmga.org
- Prayer Requests: prayer@dmga.org
- Visit us during service times

## License

© 2025 Destiny Mission Global Assembly. All rights reserved.
