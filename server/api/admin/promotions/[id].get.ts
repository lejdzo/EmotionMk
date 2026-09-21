import { defineEventHandler, getRouterParam, createError } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  const db = await getMongoDb()
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing promotion id.' })
  }

  const promo = await db.collection('promotions').findOne(
    { id },
    { projection: { _id: 0 } }
  )

  if (!promo) {
    throw createError({ statusCode: 404, statusMessage: 'Promotion not found.' })
  }

  return {
    ok: true,
    data: promo
  }
})