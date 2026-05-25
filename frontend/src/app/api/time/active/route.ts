import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, handleApiError } from '@/utils/supabase/helpers'

/**
 * GET /api/time/active
 *
 * Returns all employees currently clocked in (clock_out IS NULL).
 * Powers the "Currently Clocked In" dashboard widget.
 */
export async function GET(_request: NextRequest) {
  try {
    const { supabase, orgId } = await requireOrg()

    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        id,
        clock_in,
        clock_in_lat,
        clock_in_lng,
        flagged,
        flag_reason,
        employee:employees(id, name, badge, department, role),
        job:jobs(id, name, customer, color)
      `)
      .eq('org_id', orgId)
      .is('clock_out', null)
      .order('clock_in')

    if (error) throw error

    // Annotate with how long each person has been clocked in
    const now = Date.now()
    const annotated = (data ?? []).map((entry) => ({
      ...entry,
      minutes_elapsed: Math.round((now - new Date(entry.clock_in).getTime()) / 60000),
    }))

    return NextResponse.json(annotated)
  } catch (err) {
    return handleApiError(err)
  }
}
