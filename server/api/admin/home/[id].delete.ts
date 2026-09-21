import { defineEventHandler, createError } from 'h3'
import { ObjectId } from 'mongodb'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing home item id'
    })
  }

  if (!ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid home item id'
    })
  }

  const db = await getMongoDb()

  const result = await db.collection('home').deleteOne({
    _id: new ObjectId(id)
  })

  if (!result.deletedCount) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Home item not found'
    })
  }

  return {
    ok: true
  }
})