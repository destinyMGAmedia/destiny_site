import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const revalidate = 0

export async function GET() {
  try {
    const channel = await prisma.youtubeChannel
      .findUnique({ where: { channelType: 'MAIN_LIVE' } })
      .catch(() => null)

    if (!channel?.channelId) {
      return NextResponse.json({ isLive: false })
    }

    const channelId = channel.channelId
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/channel/${channelId}/live&format=json`

    const res = await fetch(oembedUrl, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5000),
    })

    if (res.ok) {
      const data = await res.json()
      // oEmbed returns data when there's an active live stream on the channel/live page
      const isLive = !!data?.title
      return NextResponse.json({ isLive, channelId })
    }

    return NextResponse.json({ isLive: false, channelId })
  } catch {
    return NextResponse.json({ isLive: false })
  }
}
