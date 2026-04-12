# Destiny Mission Global Assembly Website (DMGA)

Official website and management platform for Destiny Mission Global Assembly — a vibrant community committed to igniting faith, transforming lives, and reaching nations.

This project has been modernized from a static Vite/React implementation to a dynamic **Next.js 16** application with a comprehensive administrative dashboard and real-time content management.

## 🚀 Key Features

- **Dynamic Assembly Management**: Support for multiple church branches (Assemblies) with custom slugs, location-based info, and individual content control.
- **Admin Dashboard**: A secure, role-based management system for all aspects of the church operations.
- **Role-Based Access Control (RBAC)**:
  - `SUPER_ADMIN`: Full system control, analytics, and global admin management.
  - `GLOBAL_ADMIN`: Manage all assemblies, admin accounts, and global content.
  - `ASSEMBLY_ADMIN`: Full management of a specific branch (content, members, finances, reports).
  - `APP_ADMIN`: Restricted to updating page sections and content for a specific branch.
- **Member Database**: Comprehensive tracking of members, including fellowship/department affiliations and baptism records.
- **Reporting & Analytics**: Weekly, monthly, and annual reporting for attendance, salvations, and finances.
- **Content Management System (CMS)**:
  - **Media**: Photos, videos, and sermons (audio) with Cloudinary integration.
  - **Devotionals**: Scheduled daily readings.
  - **Events**: Global and assembly-specific event calendars.
  - **Games**: Interactive Bible-based games (Crosswords, Quizzes, etc.).
  - **Hero Slides**: Manage landing page banners.
- **Interactive Features**: Prayer request submissions, testimony management, and automated YouTube live stream detection.

## 🛠 Tech Stack

- **Framework**: [Next.js 16.2.2](https://nextjs.org/) (App Router)
- **Language**: JavaScript (ES6+)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & PostCSS
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials Provider)
- **Media Hosting**: [Cloudinary](https://cloudinary.com/)
- **Icons**: Lucide-React & React Icons
- **Deployment**: Optimized for Vercel

## 🏁 Getting Started

### Prerequisites

- **Node.js**: v18.17.0 or higher
- **PostgreSQL**: A running instance (local or hosted like Supabase/Aiven)
- **Cloudinary Account**: For media uploads

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/destiny-site.git
   cd destiny-site
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory (see [Environment Variables](#environment-variables) section below).

4. Initialize the database:
   ```bash
   # Push schema to database
   npm run db:push
   
   # Generate Prisma client
   npx prisma generate
   
   # Seed initial data (HQ assembly, admins, default sections)
   npm run db:seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the result.

### Scripts

- `npm run dev`: Starts development server.
- `npm run build`: Creates an optimized production build.
- `npm run start`: Starts the production server.
- `npm run db:push`: Synchronizes Prisma schema with the database.
- `npm run db:seed`: Populates the database with initial required data.
- `npm run db:studio`: Opens Prisma Studio to view/edit data in the browser.

## 📁 Project Structure

```
destiny_site/
├── prisma/              # Database schema and seed scripts
├── public/              # Static assets (logos, favicons)
├── src/
│   ├── app/             # Next.js App Router (Routes & API)
│   │   ├── (public)/    # Main website pages (Home, About, Media, etc.)
│   │   ├── admin/       # Admin dashboard routes
│   │   └── api/         # Backend API endpoints
│   ├── components/      # Reusable React components
│   │   ├── admin/       # Dashboard-specific UI
│   │   ├── home/        # Landing page sections
│   │   ├── layout/      # Navbar, Footer, Providers
│   │   └── ui/          # Base UI primitives (buttons, inputs)
│   ├── lib/             # Utility functions and configurations
│   │   ├── auth.js      # NextAuth configuration & RBAC helpers
│   │   ├── prisma.js    # Database client with auto-reconnect proxy
│   │   └── cloudinary.js # Media upload utilities
│   └── styles/          # Global CSS and Tailwind configurations
├── MVP/                 # Legacy static prototype (Reference only)
└── package.json         # Project dependencies and scripts
```

## 🔐 Environment Variables

Create a `.env` file with the following keys:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Seeding (Optional)
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="securepassword"
```

## 👥 Authentication & Roles

The system uses a hierarchical role system:
- **Default Credentials**: Check `prisma/seed.js` for initial login details created during `npm run db:seed`.
- **Super Admin**: Can access the `/admin/system` area to monitor global logs and platform health.
- **Assembly Scope**: Admins are tied to specific assemblies. An `ASSEMBLY_ADMIN` for "HQ" cannot modify "Lagos" assembly data.

## 📺 Media & YouTube

- **Live Stream**: The homepage automatically detects if a channel is live using the YouTube API (if configured) or falls back to the latest uploaded video.
- **Gallery**: Managed via the Admin Dashboard. New media items are uploaded to Cloudinary and referenced in the PostgreSQL database.

## 🏛 Legacy Reference

The `MVP/` folder contains the original static HTML/CSS/JS version of the website. It is kept for historical reference and should not be used for new feature development.

## 📜 License

© 2025 Destiny Mission Global Assembly. All rights reserved.
