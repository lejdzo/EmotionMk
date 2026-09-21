import { createError, defineEventHandler, readBody } from 'h3'
import { getMongoDb } from '~/server/utils/mongodb'
import { verifyPassword } from '~/server/utils/password'
import { setSessionCookie } from '~/server/utils/session'

type LoginBody = {
  username?: string
  password?: string
}

type UserDoc = {
  username: string
  role?: string
  passwordHash?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBody>(event)

  const username = String(body?.username || '').trim()
  const password = String(body?.password || '')

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required'
    })
  }

  const db = await getMongoDb()

  const user = await db.collection('users').findOne(
    { username, active: { $ne: false } },
    {
      projection: {
        _id: 0,
        username: 1,
        role: 1,
        passwordHash: 1
      }
    }
  ) as UserDoc | null

  if (!user?.passwordHash) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  const ok = await verifyPassword(user.passwordHash, password)

  if (!ok) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  const role = user.role === 'editor' ? 'editor' : 'owner'

  setSessionCookie(event, {
    username: user.username,
    role
  })

  return {
    ok: true,
    user: {
      username: user.username,
      role
    }
  }
})
