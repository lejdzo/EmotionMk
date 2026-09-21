import { defineEventHandler } from 'h3'
import { clearSessionCookie } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  clearSessionCookie(event)

  return {
    ok: true
  }
})
