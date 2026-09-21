import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { saveMultipartImage } from '~/server/utils/upload'

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event)

  if (!files?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const file = files.find((f) => f.name === 'image')
  const saved = await saveMultipartImage(file, 'home')

  return {
    ok: true,
    path: saved.path
  }
})
