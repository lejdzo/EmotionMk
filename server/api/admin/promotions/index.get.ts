import { defineEventHandler } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async () => {
  const db = await getMongoDb()

  const products = await db
    .collection('products')
    .find({}, { projection: { _id: 0 } })
    .sort({ id: 1 })
    .toArray()

  return {
    ok: true,
    data: products
  }
})