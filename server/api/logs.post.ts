/**
 * API endpoint for receiving client-side error logs
 * POST /api/logs
 */

import { defineEventHandler, readBody } from 'h3'
import { logger } from '~/server/utils/logger'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { level, message, timestamp, url, userAgent, error } = body

    logger.warn(`Client Error: ${message}`, {
      route: url,
      error: error
    })

    return { ok: true }
  } catch (err) {
    logger.error('Failed to process client log', err)
    return { ok: false, error: 'Failed to log' }
  }
})
