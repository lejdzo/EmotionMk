import { defineEventHandler } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async () => {
  const db = await getMongoDb()

  const items = await db.collection('products')
    .find({})
    .project({
      _id: 1,
      id: 1,
      displayName: 1,
      shortDescription: 1,
      specs: 1,
      pricing: 1,
      images: 1,
      updatedAt: 1
    })
    .toArray()

  return {
    ok: true,
    items: items.map((item: any) => ({
      _id: String(item._id),
      id: item.id || '',
      displayName: item.displayName || { mk: '', en: '', sq: '' },
      shortDescription: item.shortDescription || { mk: '', en: '', sq: '' },
      specs: item.specs || {},
      pricing: item.pricing || { regularPrice: 0, currency: 'EUR' },
      images: item.images || { cover: '', gallery: [], extra: [] },
      updatedAt: item.updatedAt || null
    }))
  }
})