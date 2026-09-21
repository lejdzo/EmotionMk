import { defineEventHandler, getQuery } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  const db = await getMongoDb()
  const q = getQuery(event)
  const admin = String(q.admin || '') === 'true'

  if (admin) {
    const items = await db.collection('testRides')
      .find({}, { projection: { _id: 0 } })
      .sort({ day: 1, hour: 1 })
      .toArray()
    return { ok: true, data: items }
  }

  const blocked = await db.collection('testRides')
    .find(
      { status: { $in: ['pending', 'confirmed'] } },
      { projection: { _id: 0, id: 1, day: 1, hour: 1, status: 1 } }
    )
    .sort({ day: 1, hour: 1 })
    .toArray()

  return { ok: true, data: blocked }
})