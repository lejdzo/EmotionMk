import { createError, defineEventHandler, readBody } from 'h3'
import { ObjectId } from 'mongodb'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  const id = String(event.context.params?.id || '').trim()

  if (!id || !ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid gallery id'
    })
  }

  const body = await readBody(event)

  const src = String(body?.src || '').trim()
  const category = String(body?.category || '').trim()
  const sortOrder = Number(body?.sortOrder || 0)
  const active = Boolean(body?.active)

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

  const result = await db.collection('gallery').updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        src,
        category,
        sortOrder,
        active
      }
    }
  )

  if (!result.matchedCount) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Gallery item not found'
    })
  }

  return {
    ok: true
  }
})