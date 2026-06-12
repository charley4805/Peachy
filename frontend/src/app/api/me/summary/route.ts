import { NextResponse } from 'next/server'
import { handleApiError } from '@/utils/supabase/helpers'
import { requireEmployee, entryHours, mondayOf } from '@/utils/supabase/employee-helpers'

/**
 * GET /api/me/summary
 *
 * Everything the employee home screen needs in one round trip:
 * active time entry, today / this-week hours, upcoming shifts,
 * active jobs (for the clock-in job picker) and pending PTO count.
 */
export async function GET() {
  try {
    const { admin, employee } = await requireEmployee()

    const today = new Date().toISOString().slice(0, 10)
    const weekStart = mondayOf(new Date())
    const horizon = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

    const [activeRes, entriesRes, shiftsRes, jobsRes, ptoRes] = await Promise.all([
      admin
        .from('time_entries')
        .select('id, clock_in, job_id, job:jobs(name, color, location:locations(name, address))')
        .eq('employee_id', employee.id)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1),
      admin
        .from('time_entries')
        .select('clock_in, clock_out, break_minutes')
        .eq('employee_id', employee.id)
        .gte('clock_in', `${weekStart}T00:00:00Z`)
        .not('clock_out', 'is', null),
      admin
        .from('schedule_entries')
        .select('id, date, start_time, end_time, type, notes, job:jobs(name, color)')
        .eq('employee_id', employee.id)
        .gte('date', today)
        .lte('date', horizon)
        .order('date')
        .order('start_time'),
      admin
        .from('jobs')
        .select(
          'id, name, customer, color, location:locations(name, address, latitude, longitude, radius_meters, validation_mode)'
        )
        .eq('org_id', employee.org_id)
        .eq('status', 'active')
        .order('name'),
      admin
        .from('pto_requests')
        .select('id', { count: 'exact', head: true })
        .eq('employee_id', employee.id)
        .eq('status', 'pending'),
    ])

    const closed = entriesRes.data ?? []
    let weekHours = 0
    let todayHours = 0
    for (const e of closed) {
      const h = entryHours(e.clock_in, e.clock_out, e.break_minutes ?? 0)
      weekHours += h
      if (e.clock_in.slice(0, 10) === today) todayHours += h
    }

    return NextResponse.json({
      employee: {
        id: employee.id,
        name: employee.name,
        badge: employee.badge,
        role: employee.role,
      },
      active_entry: activeRes.data?.[0] ?? null,
      today_hours: Math.round(todayHours * 100) / 100,
      week_hours: Math.round(weekHours * 100) / 100,
      upcoming_shifts: shiftsRes.data ?? [],
      jobs: jobsRes.data ?? [],
      pending_pto: ptoRes.count ?? 0,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
