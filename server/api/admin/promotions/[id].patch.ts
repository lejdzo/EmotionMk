import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  const db = await getMongoDb()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing promotion id.' })
  }

  const update: Record<string, any> = {}

  if ('percent' in body) {
    const percent = Number(body.percent)
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      throw createError({ statusCode: 400, statusMessage: 'Percent must be between 0 and 100.' })
    }
    update.percent = percent
  }

  if ('active' in body) {
    update.active = Boolean(body.active)
  }

  if ('appliedTo' in body) {
    if (!Array.isArray(body.appliedTo)) {
      throw createError({ statusCode: 400, statusMessage: 'appliedTo must be an array.' })
    }

    update.appliedTo = body.appliedTo
      .map((x: any) => String(x).trim())
      .filter(Boolean)
  }

  if ('id' in body) {
    const newId = String(body.id || '').trim()
    if (!newId) {
      throw createError({ statusCode: 400, statusMessage: 'Promotion id cannot be empty.' })
    }

    if (newId !== id) {
      const exists = await db.collection('promotions').findOne({ id: newId })
      if (exists) {
        throw createError({ statusCode: 409, statusMessage: 'Another promotion with this id already exists.' })
      }
      update.id = newId
    }
  }

  update.updatedAt = new Date()

  const res = await db.collection('promotions').findOneAndUpdate(
    { id },
    { $set: update },
    {
      returnDocument: 'after',
      projection: { _id: 0 }
    }
  )

  // Mongo driver versions differ; handle both shapes
  const updatedPromo = (res as any)?.value ?? res

  if (!updatedPromo) {
    throw createError({ statusCode: 404, statusMessage: 'Promotion not found.' })
  }

  return {
    ok: true,
    message: 'Promotion updated.',
    data: updatedPromo
  }
})