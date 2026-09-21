import { createError, defineEventHandler } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  const id = String(event.context.params?.id || '').trim()

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing product id'
    })
  }

  const db = await getMongoDb()

  const item = await db.collection('products').findOne(
    { id },
    {
      projection: {
        _id: 1,
        id: 1,
        displayName: 1,
        shortDescription: 1,
        specs: 1,
        pricing: 1,
        images: 1,
        updatedAt: 1
      }
    }
  )

  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found'
    })
  }

  return {
    ok: true,
    item: {
      _id: String(item._id),
      id: item.id || '',
      displayName: item.displayName || { mk: '', en: '', sq: '' },
      shortDescription: item.shortDescription || { mk: '', en: '', sq: '' },
      specs: item.specs || {},
      pricing: item.pricing || { regularPrice: 0, currency: 'EUR' },
      images: item.images || { cover: '', gallery: [], extra: [] },
      updatedAt: item.updatedAt || null
    }
  }
})