import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const THUMBNAIL_PATHS = [
  'maxresdefault.jpg',
  'sddefault.jpg',
  'hqdefault.jpg',
  'mqdefault.jpg',
  'default.jpg',
]

function isValidYouTubeId(videoId: string) {
  return /^[A-Za-z0-9_-]{11}$/.test(videoId)
}

function parseJpegDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null

  let offset = 2
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1
      continue
    }

    const marker = buffer[offset + 1]
    offset += 2

    if (marker === 0xd8 || marker === 0xd9) continue
    if (offset + 2 > buffer.length) break

    const segmentLength = buffer.readUInt16BE(offset)
    if (segmentLength < 2 || offset + segmentLength > buffer.length) break

    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)

    if (isStartOfFrame && offset + 7 < buffer.length) {
      const height = buffer.readUInt16BE(offset + 3)
      const width = buffer.readUInt16BE(offset + 5)
      return { width, height }
    }

    offset += segmentLength
  }

  return null
}

function isUsableThumbnail(buffer: Buffer, contentType: string | null) {
  const normalizedType = (contentType || '').toLowerCase()
  if (!normalizedType.includes('jpeg') && !normalizedType.includes('jpg')) {
    return buffer.length > 4096
  }

  const dimensions = parseJpegDimensions(buffer)
  if (!dimensions) return false
  return dimensions.width > 120 || dimensions.height > 90
}

async function fetchThumbnailResponse(videoId: string) {
  for (const path of THUMBNAIL_PATHS) {
    const response = await fetch(`https://i.ytimg.com/vi/${videoId}/${path}`, {
      cache: 'force-cache',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; BrighterNepalThumbnailProxy/1.0)',
      },
      next: { revalidate: 86400 },
    })

    if (!response.ok) continue

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    if (!isUsableThumbnail(buffer, response.headers.get('content-type'))) continue

    return {
      buffer,
      contentType: response.headers.get('content-type') || 'image/jpeg',
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const videoId = String(body?.videoId || '').trim()

    if (!isValidYouTubeId(videoId)) {
      return NextResponse.json({ success: false, message: 'Invalid video id' }, { status: 400 })
    }

    const thumbnail = await fetchThumbnailResponse(videoId)
    if (!thumbnail) {
      return NextResponse.json({ success: false, message: 'Thumbnail not found' }, { status: 404 })
    }

    return new NextResponse(thumbnail.buffer, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Content-Type': thumbnail.contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to load thumbnail' }, { status: 500 })
  }
}
