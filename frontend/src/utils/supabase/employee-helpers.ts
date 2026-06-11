import { createClient } from './server'
import { createAdminClient } from './admin'

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
  userId: string
  employee: EmployeeRecord
}

/**
 * Verifies the request is from a signed-in user linked to an Active
 * employee record (via the invite flow setting employees.user_id).
 * Throws a typed error on failure — catch with `handleApiError()`.
 */
export async function requireEmployee(): Promise<EmployeeContext> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }

  const admin = createAdminClient()

  const { data: employee } = await admin
    .from('employees')
    .select(
      'id, org_id, name, badge, role, department, pay_type, pay_rate, pay_unit, status, hire_date, email, phone, avatar_url, pto_allowance_hours, user_id'
    )
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

  return { admin, userId: user.id, employee: employee as EmployeeRecord }
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
