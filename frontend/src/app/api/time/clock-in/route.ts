import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, handleApiError, haversineMetres } from '@/utils/supabase/helpers'

/**
 * POST /api/time/clock-in
 *
 * Body: {
 *   employee_id: string
 *   job_id?: string
 *   lat?: number          — device GPS latitude
 *   lng?: number          — device GPS longitude
 *   notes?: string
 * }
 *
 * If the employee is already clocked in this request is rejected.
 * If the job has a geofenced location, distance is validated against
 * the org's validation_mode (off | warn | require).
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, orgId } = await requireOrg()
    const body = await request.json()

    if (!body.employee_id) {
      return NextResponse.json({ error: 'employee_id is required' }, { status: 400 })
    }

    // Reject if already clocked in (open entry with no clock_out)
    const { data: open } = await supabase
      .from('time_entries')
      .select('id')
      .eq('org_id', orgId)
      .eq('employee_id', body.employee_id)
      .is('clock_out', null)
      .limit(1)
      .single()

    if (open) {
      return NextResponse.json(
        { error: 'Employee is already clocked in', entry_id: open.id },
        { status: 409 }
      )
    }

    // Geofence check (if job has a linked location)
    let geofenceWarning: string | null = null
    let flagged = false
    let flagReason: string | null = null

    if (body.job_id && body.lat != null && body.lng != null) {
      const { data: job } = await supabase
        .from('jobs')
        .select('location:locations(latitude, longitude, radius_meters, validation_mode)')
        .eq('id', body.job_id)
        .eq('org_id', orgId)
        .single()

      const rawLoc = job?.location
      const loc = (Array.isArray(rawLoc) ? rawLoc[0] : rawLoc) as
        | { latitude: number; longitude: number; radius_meters: number; validation_mode: string }
        | null
        | undefined
      if (loc?.latitude && loc?.longitude) {
        const dist = haversineMetres(body.lat, body.lng, loc.latitude, loc.longitude)
        if (dist > loc.radius_meters) {
          const msg = `${Math.round(dist)}m from job site (allowed: ${loc.radius_meters}m)`
          if (loc.validation_mode === 'require') {
            return NextResponse.json(
              { error: `Outside geofence: ${msg}` },
              { status: 422 }
            )
          }
          if (loc.validation_mode === 'warn') {
            geofenceWarning = msg
            flagged = true
            flagReason = `Geofence: ${msg}`
          }
        }
      }
    }

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        org_id:       orgId,
        employee_id:  body.employee_id,
        job_id:       body.job_id ?? null,
        clock_in:     new Date().toISOString(),
        clock_in_lat: body.lat ?? null,
        clock_in_lng: body.lng ?? null,
        notes:        body.notes ?? null,
        flagged,
        flag_reason:  flagReason,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      { ...data, geofence_warning: geofenceWarning },
      { status: 201 }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
