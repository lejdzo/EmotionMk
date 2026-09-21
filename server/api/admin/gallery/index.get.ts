import { defineEventHandler } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async () => {
  const db = await getMongoDb()

  const items = await db
    .collection('gallery')
    .find({})
    .project({
      _id: 1,
      src: 1,
      category: 1,
      sortOrder: 1,
      active: 1
    })
    .sort({ sortOrder: 1, _id: 1 })
    .toArray()

  return {
    ok: true,
    items: items.map((item: any) => ({
      _id: String(item._id),
      src: item.src || '',
      category: item.category || '',
      sortOrder: Number(item.sortOrder || 0),
      active: Boolean(item.active)
    }))
  }
})