import { createError, defineEventHandler, readBody } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const src = String(body?.src || '').trim()
  const category = String(body?.category || '').trim()
  const sortOrder = Number(body?.sortOrder || 0)
  const active = body?.active === undefined ? true : Boolean(body.active)

  if (!src) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image src is required'
    })
  }

  if (!category) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category is required'
    })
  }

  const db = await getMongoDb()

  const result = await db.collection('gallery').insertOne({
    src,
    category,
    sortOrder,
    active
  })

  return {
    ok: true,
    insertedId: String(result.insertedId)
  }
})