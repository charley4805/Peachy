import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, haversineMetres } from '@/utils/supabase/helpers'
import { requireEmployee } from '@/utils/supabase/employee-helpers'

/**
 * POST /api/me/clock-in
 *
 * Body: { job_id?: string, lat?: number, lng?: number, notes?: string }
 *
 * Same rules as the admin clock-in route, but the employee identity comes
 * from the signed-in session — an employee can only ever clock themselves in.
 */
export async function POST(request: NextRequest) {
  try {
    const { admin, employee } = await requireEmployee()
    const body = await request.json()

    const { data: open } = await admin
      .from('time_entries')
      .select('id')
      .eq('employee_id', employee.id)
      .is('clock_out', null)
      .limit(1)
      .single()

    if (open) {
      return NextResponse.json(
        { error: 'You are already clocked in', entry_id: open.id },
        { status: 409 }
      )
    }

    let geofenceWarning: string | null = null
    let flagged = false
    let flagReason: string | null = null

    if (body.job_id && body.lat != null && body.lng != null) {
      const { data: job } = await admin
        .from('jobs')
        .select('location:locations(latitude, longitude, radius_meters, validation_mode)')
        .eq('id', body.job_id)
        .eq('org_id', employee.org_id)
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

    const { data, error } = await admin
      .from('time_entries')
      .insert({
        org_id:       employee.org_id,
        employee_id:  employee.id,
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
