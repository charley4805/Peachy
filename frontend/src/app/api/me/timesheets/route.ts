import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/utils/supabase/helpers'
import { requireEmployee, entryHours } from '@/utils/supabase/employee-helpers'

type DayEntry = {
  id: string
  clock_in: string
  clock_out: string | null
  break_minutes: number
  hours: number
  job_name: string | null
  flagged: boolean
}

type DayRow = {
  date: string
  hours: number
  entries: DayEntry[]
}

/**
 * GET /api/me/timesheets?start=YYYY-MM-DD&end=YYYY-MM-DD
 *
 * Days worked within the period (one row per day that has time entries),
 * with per-day and period totals. The client picks the period: weekly,
 * bi-weekly, or monthly.
 */
export async function GET(request: NextRequest) {
  try {
    const { admin, employee } = await requireEmployee()
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (
      !start || !end ||
      !/^\d{4}-\d{2}-\d{2}$/.test(start) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(end) ||
      end < start
    ) {
      return NextResponse.json(
        { error: 'start and end are required (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    const { data: entries, error } = await admin
      .from('time_entries')
      .select('id, clock_in, clock_out, break_minutes, flagged, job:jobs(name)')
      .eq('employee_id', employee.id)
      .gte('clock_in', `${start}T00:00:00Z`)
      .lt('clock_in', new Date(new Date(`${end}T00:00:00Z`).getTime() + 86400000)
        .toISOString())
      .order('clock_in')

    if (error) throw error

    const days = new Map<string, DayRow>()
    let totalHours = 0

    for (const e of entries ?? []) {
      const date = e.clock_in.slice(0, 10)
      const hours = entryHours(e.clock_in, e.clock_out, e.break_minutes ?? 0)
      const rawJob = e.job
      const job = (Array.isArray(rawJob) ? rawJob[0] : rawJob) as { name: string } | null

      const row: DayRow = days.get(date) ?? { date, hours: 0, entries: [] }
      row.entries.push({
        id: e.id,
        clock_in: e.clock_in,
        clock_out: e.clock_out,
        break_minutes: e.break_minutes ?? 0,
        hours: Math.round(hours * 100) / 100,
        job_name: job?.name ?? null,
        flagged: e.flagged,
      })
      row.hours += hours
      days.set(date, row)
      totalHours += hours
    }

    return NextResponse.json({
      period_start: start,
      period_end: end,
      days: [...days.values()].map((d) => ({
        ...d,
        hours: Math.round(d.hours * 100) / 100,
      })),
      total_hours: Math.round(totalHours * 100) / 100,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
