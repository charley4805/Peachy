import { createHmac, timingSafeEqual, scryptSync, randomBytes } from 'crypto'

/**
 * Badge + PIN portal authentication helpers.
 *
 * Portal sessions don't use Supabase auth — the token is an HMAC-signed
 * employee ID set as an HTTP-only cookie ('portal_session'). It is accepted
 * by `requireEmployee()` alongside regular Supabase sessions, so a badge+PIN
 * login gets the same /employee app as an invited account.
 */

const PORTAL_SECRET =
  process.env.PORTAL_SESSION_SECRET ?? 'change-me-in-production'

export const PORTAL_COOKIE = 'portal_session'
export const PORTAL_SESSION_HOURS = 12

// ── PIN helpers (scrypt) ─────────────────────────────────────────────────────

export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(pin, salt, 32).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPin(pin: string, stored: string): boolean {
  const [salt, expected] = stored.split(':')
  if (!salt || !expected) return false
  try {
    const computed = scryptSync(pin, salt, 32).toString('hex')
    return timingSafeEqual(
      Buffer.from(computed, 'hex'),
      Buffer.from(expected, 'hex')
    )
  } catch {
    return false
  }
}

// ── Session token ─────────────────────────────────────────────────────────────

export function signPortalToken(employeeId: string): string {
  const payload = `${employeeId}.${Date.now()}`
  const sig = createHmac('sha256', PORTAL_SECRET).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifyPortalToken(token: string): string | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [id, ts, sig] = parts
  const expected = createHmac('sha256', PORTAL_SECRET)
    .update(`${id}.${ts}`)
    .digest('hex')
  try {
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) {
      return null
    }
  } catch {
    return null
  }
  if (Date.now() - parseInt(ts) > PORTAL_SESSION_HOURS * 3600 * 1000) return null
  return id
}
