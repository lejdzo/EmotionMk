import { defineEventHandler, createError } from 'h3'
import { ObjectId } from 'mongodb'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing home item id'
    })
  }

  if (!ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid home item id'
    })
  }

  const db = await getMongoDb()

  const item = await db.collection('home').findOne(
    {
      _id: new ObjectId(id)
    },
    {
      projection: {
        _id: 1,
        img: 1,
        header: 1,
        description: 1
      }
    }
  )

  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Home item not found'
    })
  }

  return {
    ok: true,
    item: {
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
    }
  }
})
