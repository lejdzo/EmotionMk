import crypto from 'node:crypto'
import {
  getCookie,
  setCookie,
  deleteCookie,
  createError,
  type H3Event
} from 'h3'
import { useRuntimeConfig } from '#imports'

export type AdminRole = 'owner' | 'editor'

type SessionPayload = {
  username: string
  role: AdminRole
  exp: number
}

type SessionUser = {
  username: string
  role: AdminRole
}

const COOKIE_NAME = 'admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 12

function getSecret(event: H3Event) {
  const config = useRuntimeConfig(event)
  const secret = config.sessionSecret || process.env.SESSION_SECRET

  if (!secret) {
    throw new Error('Missing SESSION_SECRET')
  }

  return String(secret)
}

function b64urlEncode(input: Buffer | string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function b64urlDecode(input: string) {
  const normalized = input
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const padding =
    normalized.length % 4 === 0
      ? ''
      : '='.repeat(4 - (normalized.length % 4))

  return Buffer.from(normalized + padding, 'base64').toString('utf8')
}

function sign(data: string, secret: string) {
  return b64urlEncode(
    crypto.createHmac('sha256', secret).update(data).digest()
  )
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)

  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

function createSessionToken(event: H3Event, data: SessionUser) {
  const payload: SessionPayload = {
    username: data.username,
    role: data.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  }

  const payloadB64 = b64urlEncode(JSON.stringify(payload))
  const signature = sign(payloadB64, getSecret(event))

  return `${payloadB64}.${signature}`
}

function readSessionToken(event: H3Event, token?: string | null): SessionPayload | null {
  if (!token) return null

  const [payloadB64, signature] = token.split('.')
  if (!payloadB64 || !signature) return null

  const expected = sign(payloadB64, getSecret(event))
  if (!safeEqual(signature, expected)) return null

  try {
    const payload = JSON.parse(b64urlDecode(payloadB64)) as SessionPayload

    if (!payload?.username || !payload?.role || !payload?.exp) return null
    if (!['owner', 'editor'].includes(payload.role)) return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null

    return payload
  } catch {
    return null
  }
}

export function setSessionCookie(event: H3Event, data: SessionUser) {
  const token = createSessionToken(event, data)

  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    //secure: process.env.NODE_ENV === 'production',
    secure: false,
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  })
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function getAdminSession(event: H3Event): SessionPayload | null {
  const token = getCookie(event, COOKIE_NAME)
  return readSessionToken(event, token)
}

export function requireAdmin(event: H3Event): SessionPayload {
  const session = getAdminSession(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  if (!['owner', 'editor'].includes(session.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }

  return session
}
