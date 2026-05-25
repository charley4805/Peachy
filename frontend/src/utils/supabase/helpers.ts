import { createClient } from './server'
import { NextResponse } from 'next/server'

export type OrgContext = {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  orgId: string
}

/**
 * Verifies the request is authenticated and the user belongs to an org.
 * Throws a typed error on failure — catch with `handleApiError()`.
 */
export async function requireOrg(): Promise<OrgContext> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!member?.org_id) {
    throw Object.assign(new Error('No organization found'), { status: 403 })
  }

  return { supabase, userId: user.id, orgId: member.org_id }
}

/** Standardised error response for API route catch blocks. */
export function handleApiError(err: unknown): NextResponse {
  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status ?? 500
    return NextResponse.json({ error: err.message }, { status })
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

/**
 * Haversine distance in metres between two lat/lng points.
 * Used for geofence validation on clock-in.
 */
export function haversineMetres(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
