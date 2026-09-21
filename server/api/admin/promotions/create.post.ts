import { defineEventHandler, readBody, createError } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  const db = await getMongoDb()
  const body = await readBody(event)

  const id = String(body?.id || '').trim()
  const percent = Number(body?.percent)
  const active = Boolean(body?.active)
  const appliedTo = Array.isArray(body?.appliedTo)
    ? body.appliedTo.map((x: any) => String(x).trim()).filter(Boolean)
    : []

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Promotion id is required.' })
  }

  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Percent must be between 0 and 100.' })
  }

  const existing = await db.collection('promotions').findOne({ id })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Promotion with this id already exists.' })
  }

  const now = new Date()

  const doc = {
    id,
    active,
    percent,
    appliedTo,
    createdAt: now,
    updatedAt: now
  }

  await db.collection('promotions').insertOne(doc)

  return {
    ok: true,
    message: 'Promotion created.',
    data: { ...doc }
  }
})