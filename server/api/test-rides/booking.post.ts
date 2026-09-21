import { createError, defineEventHandler, readBody } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'

function isYMD(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

function isHour(s: string) {
  return /^\d{2}:\d{2}$/.test(s)
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function ymdToDate(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const productId = String(body?.productId || '').trim()
  const date = String(body?.date || '').trim() // YYYY-MM-DD
  const hour = String(body?.hour || '').trim() // HH:mm
  const customerName = String(body?.customerName || '').trim()
  const customerPhone = String(body?.customerPhone || '').trim()
  const note = String(body?.note || '').trim()

  if (!productId || !date || !hour || !customerName || !customerPhone) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  if (!isYMD(date)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date format (YYYY-MM-DD)' })
  }

  if (!isHour(hour)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid hour format (HH:mm)' })
  }

  // 3 days in advance rule:
  // block today + next 2 days => earliest allowed is today+3
  const today = startOfDay(new Date())
  const minAllowed = new Date(today)
  minAllowed.setDate(minAllowed.getDate() + 1)

  const requestedDate = startOfDay(ymdToDate(date))
  if (requestedDate < minAllowed) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Booking is allowed only 1 day in advance'
    })
  }

  const db = await getMongoDb()

  // product exists?
  const product = await db.collection('products').findOne(
    { id: productId },
    { projection: { _id: 0, id: 1, active: 1 } }
  )

  if (!product || product.active === false) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product' })
  }

  // slot collision (same date + hour)
  const existing = await db.collection('testRides').findOne({
    date,
    hour,
    status: { $ne: 'cancelled' }
  })

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'This slot is already booked' })
  }

  const id = `td_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const doc = {
    id,
    productId,
    date,
    hour,
    customerName,
    customerPhone,
    note,
    status: 'booked', // booked | cancelled | done
    createdAt: new Date(),
    updatedAt: new Date()
  }

  await db.collection('testRides').insertOne(doc)

  return {
    ok: true,
    data: {
      id: doc.id,
      productId: doc.productId,
      date: doc.date,
      hour: doc.hour,
      status: doc.status
    }
  }
})
