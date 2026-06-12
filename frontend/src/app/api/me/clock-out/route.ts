import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/utils/supabase/helpers'
import { requireEmployee } from '@/utils/supabase/employee-helpers'

/**
 * POST /api/me/clock-out
 *
 * Body: { lat?: number, lng?: number, break_minutes?: number, notes?: string }
 *
 * Closes the employee's open time entry.
 */
export async function POST(request: NextRequest) {
  try {
    const { admin, employee } = await requireEmployee()
    const body = await request.json()

    const { data: open } = await admin
      .from('time_entries')
      .select('id, notes')
      .eq('employee_id', employee.id)
      .is('clock_out', null)
      .order('clock_in', { ascending: false })
      .limit(1)
      .single()

    if (!open) {
      return NextResponse.json(
        { error: 'You are not clocked in' },
        { status: 409 }
      )
    }

    const breakMinutes = Math.max(0, Math.round(Number(body.break_minutes) || 0))

    const { data, error } = await admin
      .from('time_entries')
      .update({
        clock_out:     new Date().toISOString(),
        clock_out_lat: body.lat ?? null,
        clock_out_lng: body.lng ?? null,
        break_minutes: breakMinutes,
        notes:         body.notes?.trim() ? body.notes.trim() : open.notes,
      })
      .eq('id', open.id)
      .select()
      .single()

    if (error) throw error

    // Final breadcrumb of the shift
    if (body.lat != null && body.lng != null) {
      await admin.from('location_pings').insert({
        org_id:        employee.org_id,
        employee_id:   employee.id,
        time_entry_id: open.id,
        latitude:      body.lat,
        longitude:     body.lng,
        accuracy_m:    body.accuracy ?? null,
      })
    }

    return NextResponse.json(data)
  } catch (err) {
    return handleApiError(err)
  }
}
