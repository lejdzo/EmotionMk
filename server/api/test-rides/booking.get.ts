import { defineEventHandler } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async () => {
  const db = await getMongoDb()

  const bookings = await db
    .collection('testdrive_bookings')
    .find(
      { status: { $ne: 'cancelled' } },
      {
        projection: {
          _id: 0,
          id: 1,
          productId: 1,
          date: 1,
          hour: 1,
          status: 1
        }
      }
    )
    .sort({ date: 1, hour: 1 })
    .toArray()

  return {
    ok: true,
    data: bookings
  }
})