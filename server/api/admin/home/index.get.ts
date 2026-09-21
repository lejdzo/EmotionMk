import { defineEventHandler } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async () => {
  const db = await getMongoDb()

  const items = await db
    .collection('home')
    .find({})
    .project({
      _id: 1,
      img: 1,
      header: 1,
      description: 1
    })
    .toArray()

  return {
    ok: true,
    items: items.map((item: any) => ({
      _id: String(item._id),
      img: item.img || '',
      header: {
        mk: item.header?.mk || '',
        en: item.header?.en || ''
      },
      description: {
        mk: item.description?.mk || '',
        en: item.description?.en || ''
      }
    }))
  }
})  
