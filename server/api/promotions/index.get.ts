import { defineEventHandler } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async () => {
  const db = await getMongoDb()
  const promotions = await db.collection('promotions').find({}, { projection: { _id: 0 } }).toArray()
  return { ok: true, data: promotions }
})