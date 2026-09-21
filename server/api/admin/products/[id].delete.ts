import { createError, defineEventHandler } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  const id = String(event.context.params?.id || '').trim().toLowerCase()

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing product id'
    })
  }

  const db = await getMongoDb()

  const result = await db.collection('products').deleteOne({ id })

  if (!result.deletedCount) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found'
    })
  }

  return {
    ok: true
  }
})