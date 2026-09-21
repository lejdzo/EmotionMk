import { defineEventHandler } from 'h3'
import { getAdminSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = getAdminSession(event)

  if (!session) {
    return {
      ok: true,
      authenticated: false,
      user: null
    }
  }

  return {
    ok: true,
    authenticated: true,
    user: {
      username: session.username,
      role: session.role
    }
  }
})
