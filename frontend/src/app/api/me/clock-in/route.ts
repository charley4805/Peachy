import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, haversineMetres } from '@/utils/supabase/helpers'
import { requireEmployee } from '@/utils/supabase/employee-helpers'

/**
 * POST /api/me/clock-in
 *
 * Body: { job_id?: string, lat?: number, lng?: number, notes?: string }
 *
 * The employee identity comes from the session — an employee can only
 * ever clock themselves in.
 *
 * Geofencing is ENFORCED for employee self-service: if the selected job
 * has a geofenced location (and validation_mode isn't 'off'), the device
 * must report a position inside the radius or the clock-in is rejected.
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

    if (body.job_id) {
      const { data: job } = await admin
        .from('jobs')
        .select('location:locations(name, latitude, longitude, radius_meters, validation_mode)')
        .eq('id', body.job_id)
        .eq('org_id', employee.org_id)
        .single()

      const rawLoc = job?.location
      const loc = (Array.isArray(rawLoc) ? rawLoc[0] : rawLoc) as
        | { name: string; latitude: number; longitude: number; radius_meters: number; validation_mode: string }
        | null
        | undefined

      if (loc?.latitude && loc?.longitude && loc.validation_mode !== 'off') {
        if (body.lat == null || body.lng == null) {
          return NextResponse.json(
            {
              error:
                'Location is required to clock in at this job site. Enable location services and try again.',
            },
            { status: 422 }
          )
        }
        const dist = haversineMetres(body.lat, body.lng, loc.latitude, loc.longitude)
        if (dist > loc.radius_meters) {
          return NextResponse.json(
            {
              error: `You must be on site to clock in — you are ${Math.round(dist)}m from ${loc.name} (allowed: ${loc.radius_meters}m).`,
            },
            { status: 422 }
          )
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
      })
      .select()
      .single()

    if (error) throw error

    // First breadcrumb of the shift
    if (body.lat != null && body.lng != null) {
      await admin.from('location_pings').insert({
        org_id:        employee.org_id,
        employee_id:   employee.id,
        time_entry_id: data.id,
        latitude:      body.lat,
        longitude:     body.lng,
        accuracy_m:    body.accuracy ?? null,
      })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
