import { createError, defineEventHandler, getRequestPath } from 'h3'
import { getAdminSession } from '~/server/utils/session'

export default defineEventHandler((event) => {
  const path = getRequestPath(event)

  if (!path.startsWith('/api/admin/')) return

  const session = getAdminSession(event)

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  if (!['owner', 'editor'].includes(session.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
})