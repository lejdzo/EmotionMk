import { defineEventHandler, createError, getRouterParam } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product id is required'
    })
  }

  const db = await getMongoDb()

  // If you use "active" on products, keep active: true
  // If not, remove active from query
  const product = await db.collection('products').findOne(
    { id, active: { $ne: false } },
    {
      projection: {
        _id: 0
      }
    }
  )

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: `Product not found: ${id}`
    })
  }

   return {
    ok: true,
    data: product
  }
})