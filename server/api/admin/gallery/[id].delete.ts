import { createError, defineEventHandler } from 'h3'
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

  const db = await getMongoDb()

  const result = await db.collection('gallery').deleteOne({
    _id: new ObjectId(id)
  })

  if (!result.deletedCount) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Gallery item not found'
    })
  }

  return {
    ok: true
  }
})