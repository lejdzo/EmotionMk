import { defineEventHandler, readBody, createError } from 'h3'
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

  const body = await readBody(event)

  const img = String(body?.img || '').trim()

  const header = {
    mk: String(body?.header?.mk || '').trim(),
    en: String(body?.header?.en || '').trim()
  }

  const description = {
    mk: String(body?.description?.mk || '').trim(),
    en: String(body?.description?.en || '').trim()
  }

  if (!img || !header.mk || !header.en || !description.mk || !description.en) {
    throw createError({
      statusCode: 400,
      statusMessage: 'img, header.mk, header.en, description.mk and description.en are required'
    })
  }

  const db = await getMongoDb()

  const result = await db.collection('home').updateOne(
    {
      _id: new ObjectId(id)
    },
    {
      $set: {
        img,
        header,
        description
      }
    }
  )

  if (!result.matchedCount) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Home item not found'
    })
  }

  return {
    ok: true
  }
})
