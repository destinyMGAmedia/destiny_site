import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),

  // JWT strategy — required when using CredentialsProvider
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: {
            assembly: { select: { id: true, slug: true, name: true } },
          },
        })

        if (!user) throw new Error('No account found with this email')
        if (!user.isActive) throw new Error('This account has been deactivated. Contact your administrator.')

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) throw new Error('Incorrect password')

        // Record last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          assemblyId: user.assemblyId,
          assemblySlug: user.assembly?.slug ?? null,
          assemblyName: user.assembly?.name ?? null,
        }
      },
    }),
  ],

  callbacks: {
    // Add custom fields to the JWT token on sign-in
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.assemblyId = user.assemblyId
        token.assemblySlug = user.assemblySlug
        token.assemblyName = user.assemblyName
      }

      // Allow client-side session updates (e.g. after admin reassigns a user)
      if (trigger === 'update' && session) {
        token.role = session.role ?? token.role
        token.assemblyId = session.assemblyId ?? token.assemblyId
        token.assemblySlug = session.assemblySlug ?? token.assemblySlug
        token.assemblyName = session.assemblyName ?? token.assemblyName
      }

      return token
    },

    // Expose JWT fields to the session object used in components
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.assemblyId = token.assemblyId
        session.user.assemblySlug = token.assemblySlug
        session.user.assemblyName = token.assemblyName
      }
      return session
    },
  },

  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
}

// ─────────────────────────────────────────────
// ROLE HELPERS — use these everywhere for consistent permission checks
// ─────────────────────────────────────────────

/**
 * Role hierarchy:
 * SUPER_ADMIN    → full system, analytics, manages global admins
 * GLOBAL_ADMIN   → creates assemblies, manages all admin accounts, edits any assembly
 * ASSEMBLY_ADMIN → full assembly management (content + members + finance + reports + settings)
 * APP_ADMIN      → content-only, updates page sections for their assembly
 */

export const isSuperAdmin   = (s) => s?.user?.role === 'SUPER_ADMIN'
export const isGlobalAdmin  = (s) => ['GLOBAL_ADMIN', 'SUPER_ADMIN'].includes(s?.user?.role)
export const isAssemblyAdmin = (s) => ['ASSEMBLY_ADMIN', 'GLOBAL_ADMIN', 'SUPER_ADMIN'].includes(s?.user?.role)
export const isAppAdmin     = (s) => s?.user?.role === 'APP_ADMIN'

// Any logged-in admin (all 4 roles)
export const isAnyAdmin = (s) =>
  ['SUPER_ADMIN', 'GLOBAL_ADMIN', 'ASSEMBLY_ADMIN', 'APP_ADMIN'].includes(s?.user?.role)

// Content access: APP_ADMIN, ASSEMBLY_ADMIN, GLOBAL_ADMIN, SUPER_ADMIN
export const canUpdateContent = (s, assemblyId) => {
  if (!s?.user) return false
  if (isGlobalAdmin(s)) return true
  // ASSEMBLY_ADMIN and APP_ADMIN — only their own assembly
  return ['ASSEMBLY_ADMIN', 'APP_ADMIN'].includes(s.user.role) &&
    s.user.assemblyId === assemblyId
}

// Full assembly management (attendance, finance, members, reports, settings)
export const canManageAssembly = (s, assemblyId) => {
  if (!s?.user) return false
  if (isGlobalAdmin(s)) return true
  return s.user.role === 'ASSEMBLY_ADMIN' && s.user.assemblyId === assemblyId
}

// Admin account management
export const canManageAdmins = (s) => isGlobalAdmin(s)

// System-level (analytics, super settings)
export const canManageSystem = (s) => isSuperAdmin(s)

// Landing route after login — based on role
export const getAdminLandingRoute = (user) => {
  if (user.role === 'SUPER_ADMIN' || user.role === 'GLOBAL_ADMIN') return '/admin/dashboard'
  if (user.role === 'ASSEMBLY_ADMIN') return `/admin/assemblies/${user.assemblySlug}`
  if (user.role === 'APP_ADMIN') return `/admin/assemblies/${user.assemblySlug}/content`
  return '/admin/login'
}
