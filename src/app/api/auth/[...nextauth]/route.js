import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export const GET = async (req, res) => {
  try {
    return await handler(req, res)
  } catch (error) {
    console.error('Auth Error:', error)
    return Response.json({
      error: 'Authentication failed',
      message: error.message
    }, { status: 500 })
  }
}

export const POST = async (req, res) => {
  try {
    return await handler(req, res)
  } catch (error) {
    console.error('Auth Error:', error)
    return Response.json({
      error: 'Authentication failed',
      message: error.message
    }, { status: 500 })
  }
}
