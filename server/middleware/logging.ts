/**
 * API logging middleware
 * Logs all HTTP requests and responses
 */

import { logger } from '~/server/utils/logger'

export default defineEventHandler((event) => {
  const method = getMethod(event)
  const url = getRequestURL(event)
  const path = url.pathname
  const start = Date.now()

  // Skip logging health checks and static files
  if (path.includes('.') || path === '/health' || path === '/favicon.ico') {
    return
  }

  // Log request start
  logger.debug(`Incoming ${method} request`, { 
    route: path,
    method 
  })

  // Hook into response to log completion
  const originalSend = event.node.res.end
  event.node.res.end = function(...args: any[]) {
    const duration = Date.now() - start
    const status = event.node.res.statusCode

    logger.api(method, path, status, duration)

    return originalSend.apply(this, args)
  }
})
