import { createError, defineEventHandler } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const rawUrl = event.node.req.url || '/api/gallery'
    const url = new URL(rawUrl, 'http://localhost')
    const category = String(url.searchParams.get('category') || '').trim()

    const db = await getMongoDb()

    const filter: any = {
      active: { $ne: false }
    }

    if (category) {
      filter.category = category
    }

    const items = await db
      .collection('gallery')
      .find(filter)
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
      count: items.length,
      items: items.map((item: any) => ({
        _id: String(item._id),
        src: item.src || '',
        category: item.category || '',
        sortOrder: Number(item.sortOrder || 0),
        active: Boolean(item.active)
      }))
    }
  } catch (error: any) {
    console.error('[GET /api/gallery] error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Failed to load gallery'
    })
  }
})