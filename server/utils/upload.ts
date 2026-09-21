import { createError } from 'h3'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg'
])

function extFromMime(mime: string, fallbackName: string) {
  if (mime === 'image/jpeg' || mime === 'image/jpg') return '.jpg'
  if (mime === 'image/png') return '.png'
  if (mime === 'image/webp') return '.webp'
  return path.extname(fallbackName) || '.jpg'
}

function getUploadRoot() {
  return '/var/www/html/static/emotion-storage/uploads'
}

export async function saveMultipartImage(
  file: any,
  subdir: 'gallery' | 'home' | 'products'
) {
  if (!file || !file.filename || !file.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image file is required'
    })
  }

  if (!file.type || !ALLOWED.has(file.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only JPG, JPEG, PNG and WEBP are allowed'
    })
  }

  const ext = extFromMime(file.type, file.filename)
  const fileName = `${randomUUID()}${ext}`

  const uploadDir = path.join(getUploadRoot(), subdir)
  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(path.join(uploadDir, fileName), file.data)

  return {
    ok: true,
    path: `/uploads/${subdir}/${fileName}`
  }
}
