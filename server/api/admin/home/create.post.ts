import { defineEventHandler, readBody, createError } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const img = String(body?.img || '').trim()

  const header = {
    mk: String(body?.header?.mk || '').trim(),
    en: String(body?.header?.en || '').trim()
  }

  const description = {
    mk: String(body?.description?.mk || '').trim(),
    en: String(body?.description?.en || '').trim()
  }

  if (!img || !header.mk || !header.en || !description.mk || !description.en) {
    throw createError({
      statusCode: 400,
      statusMessage: 'img, header.mk, header.en, description.mk and description.en are required'
    })
  }

  const db = await getMongoDb()

  const result = await db.collection('home').insertOne({
    img,
    header,
    description
  })

  return {
    ok: true,
    insertedId: String(result.insertedId)
  }
})
