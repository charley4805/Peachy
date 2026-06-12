import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/utils/supabase/helpers'
import { requireEmployee } from '@/utils/supabase/employee-helpers'

/**
 * POST /api/me/ping — GPS breadcrumb while on the clock
 *
 * Body: { lat: number, lng: number, accuracy?: number }
 *
 * The employee app sends one of these every few minutes while clocked in.
 * Pings are only recorded against an open time entry — off the clock,
 * nothing is stored.
 */
export async function POST(request: NextRequest) {
  try {
    const { admin, employee } = await requireEmployee()
    const body = await request.json()

    const lat = Number(body.lat)
    const lng = Number(body.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
    }

    const { data: open } = await admin
      .from('time_entries')
      .select('id')
      .eq('employee_id', employee.id)
      .is('clock_out', null)
      .order('clock_in', { ascending: false })
      .limit(1)
      .single()

    if (!open) {
      // Not clocked in — don't track
      return NextResponse.json({ recorded: false })
    }

    const { error } = await admin.from('location_pings').insert({
      org_id:        employee.org_id,
      employee_id:   employee.id,
      time_entry_id: open.id,
      latitude:      lat,
      longitude:     lng,
      accuracy_m:    Number.isFinite(Number(body.accuracy)) ? Number(body.accuracy) : null,
    })

    if (error) throw error
    return NextResponse.json({ recorded: true })
  } catch (err) {
    return handleApiError(err)
  }
}
