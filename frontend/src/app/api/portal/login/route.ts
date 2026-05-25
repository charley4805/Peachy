import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createHmac, timingSafeEqual, scryptSync, randomBytes } from 'crypto'

/**
 * POST /api/portal/login
 *
 * Employee portal authentication using badge ID + PIN.
 * Does NOT create a Supabase auth session — employees are not auth.users.
 *
 * Body: { badge: string, pin: string, org_id?: string }
 *
 * Returns: { employee, token } on success.
 * The token is an HMAC-signed employee ID — set it as a cookie on the
 * portal client and include it in subsequent portal API requests.
 *
 * PIN management (set/reset) is done by admins via the dashboard
 * calling PUT /api/employees/[id]/pin with { pin: string }.
 */

const PORTAL_SECRET =
  process.env.PORTAL_SESSION_SECRET ?? 'change-me-in-production'

// ── PIN helpers (scrypt) ─────────────────────────────────────────────────────

export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(pin, salt, 32).toString('hex')
  return `${salt}:${hash}`
}

function verifyPin(pin: string, stored: string): boolean {
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
  // Token expires after 12 hours
  if (Date.now() - parseInt(ts) > 12 * 3600 * 1000) return null
  return id
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { badge, pin } = body

    if (!badge || !pin) {
      return NextResponse.json(
        { error: 'badge and pin are required' },
        { status: 400 }
      )
    }

    // Use admin client — employee_pins has no anon access
    const admin = createAdminClient()

    // Look up the employee by badge
    const { data: employee, error: empError } = await admin
      .from('employees')
      .select('id, org_id, name, badge, role, department, status')
      .eq('badge', badge.toUpperCase().trim())
      .eq('status', 'Active')
      .single()

    if (empError || !employee) {
      // Return generic error to prevent badge enumeration
      return NextResponse.json(
        { error: 'Invalid badge or PIN' },
        { status: 401 }
      )
    }

    // Fetch the PIN record
    const { data: pinRecord } = await admin
      .from('employee_pins')
      .select('pin_hash')
      .eq('employee_id', employee.id)
      .single()

    if (!pinRecord || !verifyPin(String(pin), pinRecord.pin_hash)) {
      return NextResponse.json({ error: 'Invalid badge or PIN' }, { status: 401 })
    }

    const token = signPortalToken(employee.id)

    const response = NextResponse.json({ employee, token })

    // Set a secure, HTTP-only cookie for subsequent portal requests
    response.cookies.set('portal_session', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   12 * 3600,  // 12 hours
      path:     '/api/portal',
    })

    return response
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
