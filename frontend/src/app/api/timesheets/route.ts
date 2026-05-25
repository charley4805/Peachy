import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, handleApiError } from '@/utils/supabase/helpers'

/**
 * GET /api/timesheets?start=YYYY-MM-DD&end=YYYY-MM-DD&status=pending
 *
 * Lists timesheets for the org's current pay period or a specified range.
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, orgId } = await requireOrg()
    const { searchParams } = new URL(request.url)
    const start  = searchParams.get('start')
    const end    = searchParams.get('end')
    const status = searchParams.get('status')

    let query = supabase
      .from('timesheets')
      .select(`
        *,
        employee:employees(id, name, badge, department, pay_type, pay_rate, pay_unit)
      `)
      .eq('org_id', orgId)
      .order('period_start', { ascending: false })

    if (start)  query = query.gte('period_start', start)
    if (end)    query = query.lte('period_end',   end)
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    return handleApiError(err)
  }
}

/**
 * POST /api/timesheets
 *
 * Create or upsert a timesheet record for a pay period.
 * Typically called by a background job or when a manager closes a period,
 * but available manually for corrections.
 *
 * Body: { employee_id, period_start, period_end, regular_hours, ot_hours, total_cost }
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, orgId } = await requireOrg()
    const body = await request.json()

    if (!body.employee_id || !body.period_start || !body.period_end) {
      return NextResponse.json(
        { error: 'employee_id, period_start, and period_end are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('timesheets')
      .upsert(
        {
          org_id:        orgId,
          employee_id:   body.employee_id,
          period_start:  body.period_start,
          period_end:    body.period_end,
          regular_hours: body.regular_hours ?? 0,
          ot_hours:      body.ot_hours      ?? 0,
          total_cost:    body.total_cost    ?? null,
          status:        'pending',
        },
        { onConflict: 'org_id,employee_id,period_start' }
      )
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
