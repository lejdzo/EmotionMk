import { createError, defineEventHandler, readBody } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  const id = String(event.context.params?.id || '').trim().toLowerCase()

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing product id'
    })
  }

  const body = await readBody(event)
  const db = await getMongoDb()

  const nextId = String(body?.id || id).trim().toLowerCase()

  if (!nextId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product id is required'
    })
  }

  if (nextId !== id) {
    const existing = await db.collection('products').findOne(
      { id: nextId },
      { projection: { _id: 1 } }
    )

    if (existing) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Another product already uses this id'
      })
    }
  }

  const update = {
    id: nextId,
    displayName: {
      mk: String(body?.displayName?.mk || '').trim(),
      en: String(body?.displayName?.en || '').trim(),
      sq: String(body?.displayName?.sq || '').trim()
    },
    shortDescription: {
      mk: String(body?.shortDescription?.mk || '').trim(),
      en: String(body?.shortDescription?.en || '').trim(),
      sq: String(body?.shortDescription?.sq || '').trim()
    },
    specs: {
      motorW: Number(body?.specs?.motorW || 0),
      batteryV: Number(body?.specs?.batteryV || 0),
      tireInch: Number(body?.specs?.tireInch || 0),
      lightsFrontRear: Boolean(body?.specs?.lightsFrontRear),
      turnSignals: Boolean(body?.specs?.turnSignals),
      mirrors: Boolean(body?.specs?.mirrors),
      frontBasketOptional: Boolean(body?.specs?.frontBasketOptional)
    },
    pricing: {
      regularPrice: Number(body?.pricing?.regularPrice || 0),
      currency: String(body?.pricing?.currency || 'EUR').trim() || 'EUR'
    },
    images: {
      cover: String(body?.images?.cover || '').trim(),
      gallery: Array.isArray(body?.images?.gallery) ? body.images.gallery.map((x: any) => String(x || '').trim()).filter(Boolean) : [],
      extra: Array.isArray(body?.images?.extra) ? body.images.extra.map((x: any) => String(x || '').trim()).filter(Boolean) : []
    },
    updatedAt: new Date()
  }

  const result = await db.collection('products').updateOne(
    { id },
    { $set: update }
  )

  if (!result.matchedCount) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found'
    })
  }

  return {
    ok: true,
    id: nextId
  }
})