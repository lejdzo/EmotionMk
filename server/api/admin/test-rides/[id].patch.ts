import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

type PatchBody = {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  note?: string
}

const allowedStatuses = new Set(['pending', 'confirmed', 'cancelled', 'completed'])

export default defineEventHandler(async (event) => {
  // Protected by server/middleware/admin-api.ts
  const db = await getMongoDb()
  const id = getRouterParam(event, 'id')
  const body = await readBody<PatchBody>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing booking id'
    })
  }

  const setData: Record<string, any> = {
    updatedAt: new Date()
  }

  if (body.status) {
    if (!allowedStatuses.has(body.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid status'
      })
    }
    setData.status = body.status
  }

  if (typeof body.note === 'string') {
    setData.note = body.note.trim()
  }

  const result = await db.collection('testRides').findOneAndUpdate(
    { id },
    { $set: setData },
    {
      returnDocument: 'after',
      projection: { _id: 0 }
    }
  )

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Booking not found'
    })
  }

  return {
    ok: true,
    data: result
  }
})