# Design Guide - DMGA Next.js Design System

This guide outlines the design tokens, components, and patterns used in the modernized Destiny Mission Global Assembly website.

## 🎨 Design Tokens

The source of truth for all design tokens is `src/app/globals.css`. We use CSS variables to maintain consistency across the application.

### Core Colors
- **Purple (Brand)**:
  - `--purple-900: #2d0060;` (Primary brand color)
  - `--purple-800: #4a148c;`
  - `--purple-500: #9c27b0;`
- **Gold (Accent)**:
  - `--gold-500: #ffb300;` (Signature accent)
  - `--gold-400: #ffca28;`
- **Neutral**:
  - `--ivory: #faf8f5;` (Main background)
  - `--charcoal: #1a1a1a;` (Primary text)
  - `--surface: #ffffff;` (Card background)
  - `--border: #e5e0da;`

### Typography
- **Serif (Headings)**: `Playfair Display`, Georgia, serif.
- **Sans (Body)**: `Inter`, system-ui, sans-serif.
- **Kids (Treasures)**: `Nunito`, sans-serif.

## 🧱 Component System

### Buttons
We use a signature "lozenge" (pill) shape for primary actions.

- **Primary Button** (`.btn-primary`): Gold background, purple text. Used for main CTAs like "Give Now" or "Join Us".
- **Secondary Button** (`.btn-secondary`): Purple background, white text. Used for secondary actions.
- **Outline Button** (`.btn-outline`): Transparent background with border.

### Cards
- **Standard Card**: White background (`--surface`), subtle shadow (`--shadow-card`), and 16px radius (`--radius-card`).
- **Hover State**: Elevates with a more pronounced shadow (`--shadow-hover`) and slight upward translation.

## 🖼️ Media Management

Unlike the previous version, images and videos are now managed dynamically through the **Admin Dashboard**.

### Hero Banners
- Hero images for the homepage and assembly pages are uploaded via the admin interface to **Cloudinary**.
- Next.js's `<Image>` component is used for automatic optimization, lazy loading, and responsive sizing.

### Gallery & Media
- Photos and video thumbnails are stored in Cloudinary.
- Videos are primarily hosted on **YouTube** and referenced by their Video IDs in the database.

## 📐 Layout Patterns

- **Container**: We use a max-width of `7xl` (1280px) for main content areas.
- **Section Spacing**: Standard vertical padding for sections is `py-12` to `py-20`.
- **Alternating Backgrounds**: We alternate between `--ivory` and `--surface` to create visual separation between sections.

## 📱 Responsiveness

The site follows a mobile-first approach using Tailwind CSS's responsive prefixes:
- `sm:` (640px)
- `md:` (768px)
- `lg:` (1024px)
- `xl:` (1280px)

## 🛠 Customization

To update the global design:
1.  **Colors & Fonts**: Modify the `:root` variables in `src/app/globals.css`.
2.  **Tailwind Configuration**: Refer to `tailwind.config.mjs` (using Tailwind CSS v4).
3.  **Content**: Most visual content (images, text, banners) can be updated via the `/admin` dashboard without touching the code.

