import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import {
  verifyPin,
  signPortalToken,
  PORTAL_COOKIE,
  PORTAL_SESSION_HOURS,
} from '@/utils/portal-auth'

/**
 * POST /api/portal/login
 *
 * Employee portal authentication using badge ID + PIN.
 * Does NOT create a Supabase auth session — employees are not auth.users.
 *
 * Body: { badge: string, pin: string }
 *
 * Returns: { employee } on success and sets the 'portal_session' cookie.
 * The cookie is accepted by all /api/me/* routes, so badge+PIN sessions
 * use the same /employee app as invited accounts.
 *
 * PIN management (set/reset) is done by admins via the dashboard
 * calling PUT /api/employees/[id]/pin with { pin: string }.
 */
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

    const response = NextResponse.json({ employee })

    // Cookie path is '/' so the /employee app and /api/me/* can use it
    response.cookies.set(PORTAL_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   PORTAL_SESSION_HOURS * 3600,
      path:     '/',
    })

    return response
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
