# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Create production build
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint

### Database Operations
- `npm run db:push` - Sync Prisma schema to database (safe, non-destructive)
- `npm run db:seed` - Populate database with initial data (creates HQ assembly, admin accounts)
- `npm run db:studio` - Open Prisma Studio for database management
- `npx prisma generate` - Regenerate Prisma client after schema changes

### AI Validation
- `npm run validate:ai` - Run AI compliance validation hook (node ai-hook.js)

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16.2.2 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS v4
- **Media**: Cloudinary for image/video hosting
- **Deployment**: Optimized for Vercel

### Key Directory Structure
```
src/
├── app/
│   ├── (public)/           # Main website pages (home, about, media, assemblies)
│   ├── admin/(protected)/  # Admin dashboard with role-based access
│   └── api/               # Backend API endpoints
├── components/
│   ├── admin/             # Admin dashboard components
│   ├── assembly/          # Assembly-specific page sections
│   ├── games/             # Interactive Bible games
│   ├── home/              # Homepage sections
│   ├── layout/            # Navigation, footer, providers
│   └── ui/                # Reusable UI components
└── lib/
    ├── auth.js            # NextAuth config + role-based access helpers
    ├── prisma.js          # Database client with auto-reconnect proxy
    └── cloudinary.js      # Media upload utilities
```

### Multi-Assembly Architecture
The system supports multiple church assemblies (branches) with:
- **Assembly Slugs**: Each assembly has a unique slug for URLs (`/{slug}` routes)
- **Role-Based Access**: Hierarchical admin permissions tied to specific assemblies
- **Content Isolation**: Admins can only manage content for their assigned assembly
- **Shared Resources**: Global content (devotionals, games) available to all assemblies

### Authentication & Roles
**Role Hierarchy** (highest to lowest):
1. `SUPER_ADMIN` - Full system access, analytics, global admin management
2. `GLOBAL_ADMIN` - Create assemblies, manage all admin accounts
3. `ASSEMBLY_ADMIN` - Full assembly management (content, members, finance, reports)
4. `APP_ADMIN` - Content-only updates for specific assembly
5. `CUSTOMER/MEMBER/AGENT` - Limited frontend access

**Key Auth Helpers** (in `src/lib/auth.js`):
- `isGlobalAdmin(session)` - Can manage all assemblies
- `canManageAssembly(session, assemblyId)` - Full assembly management
- `canUpdateContent(session, assemblyId)` - Content editing permissions
- `getAdminLandingRoute(user)` - Post-login redirect based on role

### Database Schema Highlights
**Core Models**:
- `Assembly` - Church branches with settings, media, content sections
- `User` - Admin accounts with role-based permissions  
- `AssemblySection` - Dynamic page sections (hero, events, media, etc.)
- `Member` - Church membership with growth tracking
- `ServiceData` - Attendance and financial reporting
- `Game` - Interactive Bible games with multiplayer support

**Media System**:
- `MediaItem` - Photos/videos with Cloudinary integration
- `AudioContent` - Sermons and worship recordings
- `Event` - Assembly-specific or global church events

## Critical Development Rules

### Database Safety (from AI_RULES.md)
- **NEVER** use destructive commands (`prisma db push --accept-data-loss`, `prisma migrate reset`) without explicit user confirmation
- **ALWAYS** prefer non-destructive schema updates
- **ALWAYS** run `npx prisma generate` after schema changes
- **VERIFY** current database state before structural changes

### Testing Requirements  
- **Backend**: Every new API route requires corresponding test or verification script
- **Frontend**: Major UI components need test coverage or verification checklist
- **Regression**: Run existing verification scripts before submitting changes

### Code Patterns
- **Server Components**: Default to server components for data fetching
- **Role Checks**: Use auth helper functions, never hardcode role strings
- **Database**: All queries go through the auto-reconnect Prisma proxy (`src/lib/prisma.js`)
- **Media**: Use Cloudinary integration for uploads, optimize images with Next.js Image component

### Environment Setup
Required `.env` variables:
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### Common Workflows

**Adding New Assembly Section**:
1. Add section type to `SectionType` enum in `prisma/schema.prisma`
2. Create component in `src/components/assembly/`
3. Update `CustomSection.jsx` to render new type
4. Add admin editor in `src/components/admin/SectionEditor.jsx`

**Creating API Endpoint**:
1. Add route file in `src/app/api/`
2. Implement proper auth checks using role helpers
3. Use Prisma client from `src/lib/prisma.js`
4. Add error handling for connection issues
5. Create test/verification script

**Adding Admin Feature**:
1. Check user permissions with auth helpers
2. Ensure assembly-scoped access where appropriate  
3. Update admin sidebar navigation if needed
4. Test with different role levels