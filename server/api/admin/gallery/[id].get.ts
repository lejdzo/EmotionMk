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

  const item = await db.collection('gallery').findOne(
    { _id: new ObjectId(id) },
    {
      projection: {
        _id: 1,
        src: 1,
        category: 1,
        sortOrder: 1,
        active: 1
      }
    }
  )

  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Gallery item not found'
    })
  }

  return {
    ok: true,
    item: {
      _id: String(item._id),
      src: item.src || '',
      category: item.category || '',
      sortOrder: Number(item.sortOrder || 0),
      active: Boolean(item.active)
    }
  }
})