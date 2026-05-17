import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getAuthenticatedUserId } from '@/lib/auth-session'

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ code: 'NO_FILE' }, { status: 400 })
    }

    // Validate type (must be image)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ code: 'INVALID_FILE_TYPE' }, { status: 400 })
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ code: 'FILE_TOO_LARGE' }, { status: 400 })
    }

    // Read file bytes
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure target folder exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    await fs.mkdir(uploadDir, { recursive: true })

    // Generate safe, unique filename
    const fileExtension = file.name.split('.').pop() || 'png'
    const filename = `${userId}-${Date.now()}.${fileExtension}`
    const filepath = path.join(uploadDir, filename)

    // Write file to disk
    await fs.writeFile(filepath, buffer)

    // Return public relative path
    const avatarUrl = `/uploads/avatars/${filename}`
    return NextResponse.json({ success: true, avatarUrl })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
  }
}
