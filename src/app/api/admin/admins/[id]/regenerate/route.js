import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const specials = '!@#$'
  let pass = ''
  for (let i = 0; i < 8; i++) pass += chars[Math.floor(Math.random() * chars.length)]
  pass += specials[Math.floor(Math.random() * specials.length)]
  pass += Math.floor(Math.random() * 90 + 10)
  return pass
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.role === 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Cannot regenerate Super Admin credentials' }, { status: 403 })
  }

  const newPassword = generatePassword()
  const hash = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({ where: { id }, data: { password: hash } })

  return NextResponse.json({
    name: user.name,
    email: user.email,
    password: newPassword,
  })
}
