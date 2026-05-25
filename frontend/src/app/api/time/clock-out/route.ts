import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, handleApiError } from '@/utils/supabase/helpers'

/**
 * POST /api/time/clock-out
 *
 * Body: {
 *   employee_id: string
 *   lat?: number
 *   lng?: number
 *   break_minutes?: number
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, orgId } = await requireOrg()
    const body = await request.json()

    if (!body.employee_id) {
      return NextResponse.json({ error: 'employee_id is required' }, { status: 400 })
    }

    // Find the open entry
    const { data: open, error: findError } = await supabase
      .from('time_entries')
      .select('id, clock_in, job_id')
      .eq('org_id', orgId)
      .eq('employee_id', body.employee_id)
      .is('clock_out', null)
      .order('clock_in', { ascending: false })
      .limit(1)
      .single()

    if (findError || !open) {
      return NextResponse.json(
        { error: 'No open clock-in found for this employee' },
        { status: 404 }
      )
    }

    const clockOut = new Date()
    const clockIn  = new Date(open.clock_in)
    const totalMinutes =
      (clockOut.getTime() - clockIn.getTime()) / 60000 -
      (body.break_minutes ?? 0)

    const { data, error } = await supabase
      .from('time_entries')
      .update({
        clock_out:      clockOut.toISOString(),
        clock_out_lat:  body.lat           ?? null,
        clock_out_lng:  body.lng           ?? null,
        break_minutes:  body.break_minutes ?? 0,
        notes:          body.notes         ?? null,
      })
      .eq('id', open.id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      ...data,
      worked_minutes: Math.round(Math.max(0, totalMinutes)),
    })
  } catch (err) {
    return handleApiError(err)
  }
}
