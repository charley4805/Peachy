import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/utils/supabase/helpers'
import { requireEmployee, entryHours, mondayOf } from '@/utils/supabase/employee-helpers'

type WeekEntry = {
  id: string
  clock_in: string
  clock_out: string | null
  break_minutes: number
  hours: number
  job_name: string | null
  flagged: boolean
}

type Week = {
  period_start: string
  period_end: string
  total_hours: number
  status: string // open | pending | approved | locked
  entries: WeekEntry[]
}

/**
 * GET /api/me/timesheets?weeks=8
 *
 * Hours worked grouped into Monday-start weeks, computed from the
 * employee's time entries, merged with any official timesheet record
 * (status: pending/approved/locked) the org has created for that week.
 */
export async function GET(request: NextRequest) {
  try {
    const { admin, employee } = await requireEmployee()
    const { searchParams } = new URL(request.url)
    const weeksBack = Math.min(26, Math.max(1, Number(searchParams.get('weeks')) || 8))

    const currentMonday = mondayOf(new Date())
    const rangeStart = new Date(
      new Date(`${currentMonday}T00:00:00Z`).getTime() - (weeksBack - 1) * 7 * 86400000
    )
      .toISOString()
      .slice(0, 10)

    const [entriesRes, sheetsRes] = await Promise.all([
      admin
        .from('time_entries')
        .select('id, clock_in, clock_out, break_minutes, flagged, job:jobs(name)')
        .eq('employee_id', employee.id)
        .gte('clock_in', `${rangeStart}T00:00:00Z`)
        .order('clock_in'),
      admin
        .from('timesheets')
        .select('period_start, status')
        .eq('employee_id', employee.id)
        .gte('period_start', rangeStart),
    ])

    if (entriesRes.error) throw entriesRes.error

    const sheetStatus = new Map<string, string>()
    for (const s of sheetsRes.data ?? []) {
      sheetStatus.set(s.period_start, s.status)
    }

    const weeks = new Map<string, Week>()
    // Seed every week in range so empty weeks still show up
    for (let i = 0; i < weeksBack; i++) {
      const start = new Date(
        new Date(`${rangeStart}T00:00:00Z`).getTime() + i * 7 * 86400000
      )
      const periodStart = start.toISOString().slice(0, 10)
      const periodEnd = new Date(start.getTime() + 6 * 86400000)
        .toISOString()
        .slice(0, 10)
      weeks.set(periodStart, {
        period_start: periodStart,
        period_end: periodEnd,
        total_hours: 0,
        status: sheetStatus.get(periodStart) ?? 'open',
        entries: [],
      })
    }

    for (const e of entriesRes.data ?? []) {
      const periodStart = mondayOf(new Date(e.clock_in))
      const week = weeks.get(periodStart)
      if (!week) continue
      const hours = entryHours(e.clock_in, e.clock_out, e.break_minutes ?? 0)
      const rawJob = e.job
      const job = (Array.isArray(rawJob) ? rawJob[0] : rawJob) as { name: string } | null
      week.entries.push({
        id: e.id,
        clock_in: e.clock_in,
        clock_out: e.clock_out,
        break_minutes: e.break_minutes ?? 0,
        hours: Math.round(hours * 100) / 100,
        job_name: job?.name ?? null,
        flagged: e.flagged,
      })
      week.total_hours += hours
    }

    const result = [...weeks.values()]
      .map((w) => ({ ...w, total_hours: Math.round(w.total_hours * 100) / 100 }))
      .sort((a, b) => (a.period_start < b.period_start ? 1 : -1))

    return NextResponse.json(result)
  } catch (err) {
    return handleApiError(err)
  }
}
