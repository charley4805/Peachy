import { cookies } from 'next/headers'
import { createClient } from './server'
import { createAdminClient } from './admin'
import { verifyPortalToken, PORTAL_COOKIE } from '@/utils/portal-auth'

export type EmployeeRecord = {
  id: string
  org_id: string
  name: string
  badge: string
  role: string
  department: string | null
  pay_type: string
  pay_rate: number | null
  pay_unit: string
  status: string
  hire_date: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  pto_allowance_hours: number
  user_id: string | null
}

export type EmployeeContext = {
  /** Service-role client — employee writes are server-controlled, never direct. */
  admin: ReturnType<typeof createAdminClient>
  /** auth.users id for invited accounts; null for badge+PIN portal sessions. */
  userId: string | null
  /** 'account' = Supabase auth (invite flow), 'portal' = badge+PIN cookie. */
  authMethod: 'account' | 'portal'
  employee: EmployeeRecord
}

const EMPLOYEE_FIELDS =
  'id, org_id, name, badge, role, department, pay_type, pay_rate, pay_unit, status, hire_date, email, phone, avatar_url, pto_allowance_hours, user_id'

/**
 * Verifies the request comes from an Active employee, via either:
 *  1. a Supabase auth session linked through the invite flow
 *     (employees.user_id), or
 *  2. a badge+PIN portal session (HMAC 'portal_session' cookie).
 * Throws a typed error on failure — catch with `handleApiError()`.
 */
export async function requireEmployee(): Promise<EmployeeContext> {
  const admin = createAdminClient()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: employee } = await admin
      .from('employees')
      .select(EMPLOYEE_FIELDS)
      .eq('user_id', user.id)
      .eq('status', 'Active')
      .limit(1)
      .single()

    if (!employee) {
      throw Object.assign(
        new Error('No employee record linked to this account'),
        { status: 403 }
      )
    }
    return {
      admin,
      userId: user.id,
      authMethod: 'account',
      employee: employee as EmployeeRecord,
    }
  }

  // Fall back to a badge+PIN portal session
  const cookieStore = await cookies()
  const portalToken = cookieStore.get(PORTAL_COOKIE)?.value
  const employeeId = portalToken ? verifyPortalToken(portalToken) : null

  if (!employeeId) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }

  const { data: employee } = await admin
    .from('employees')
    .select(EMPLOYEE_FIELDS)
    .eq('id', employeeId)
    .eq('status', 'Active')
    .single()

  if (!employee) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }

  return {
    admin,
    userId: null,
    authMethod: 'portal',
    employee: employee as EmployeeRecord,
  }
}

/** Coworker DM channel id — sorted so both participants compute the same id. */
export function coworkerChannel(a: string, b: string): string {
  return `edm:${[a, b].sort().join(':')}`
}

/** Hours worked on a closed time entry, net of break time. */
export function entryHours(
  clockIn: string,
  clockOut: string | null,
  breakMinutes: number
): number {
  if (!clockOut) return 0
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime()
  return Math.max(0, ms / 3600000 - breakMinutes / 60)
}

/** ISO date (YYYY-MM-DD) of the Monday of the week containing `d`. */
export function mondayOf(d: Date): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = date.getUTCDay()
  date.setUTCDate(date.getUTCDate() - ((day + 6) % 7))
  return date.toISOString().slice(0, 10)
}
