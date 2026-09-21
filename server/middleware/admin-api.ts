import { defineEventHandler, getRequestPath } from 'h3'
import { requireAdmin } from '~/server/utils/session'

export default defineEventHandler((event) => {
  const path = getRequestPath(event)

  if (path.startsWith('/api/admin/')) {
    requireAdmin(event)
  }
})
