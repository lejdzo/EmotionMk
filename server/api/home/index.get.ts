import { defineEventHandler } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

type HomeItem = {
  img: string
  header: string
  description: string
}

export default defineEventHandler(async () => {
  const db = await getMongoDb()

  const items = await db
    .collection<HomeItem>('home')
    .find({}, { projection: { _id: 0, img: 1, header: 1, description: 1 } })
    .toArray()

  return {
    ok: true,
    items
  }
})