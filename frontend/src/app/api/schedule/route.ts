import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, handleApiError } from '@/utils/supabase/helpers'

// GET /api/schedule?start=YYYY-MM-DD&end=YYYY-MM-DD&employee_id=optional
export async function GET(request: NextRequest) {
  try {
    const { supabase, orgId } = await requireOrg()
    const { searchParams } = new URL(request.url)
    const start       = searchParams.get('start')
    const end         = searchParams.get('end')
    const employeeId  = searchParams.get('employee_id')

    let query = supabase
      .from('schedule_entries')
      .select(`
        *,
        employee:employees(id, name, badge, department),
        job:jobs(id, name, customer, color)
      `)
      .eq('org_id', orgId)
      .order('date')
      .order('start_time')

    if (start) query = query.gte('date', start)
    if (end)   query = query.lte('date', end)
    if (employeeId) query = query.eq('employee_id', employeeId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    return handleApiError(err)
  }
}

// POST /api/schedule  — create a shift/PTO/vacation/holiday entry
export async function POST(request: NextRequest) {
  try {
    const { supabase, orgId } = await requireOrg()
    const body = await request.json()

    if (!body.employee_id || !body.date) {
      return NextResponse.json(
        { error: 'employee_id and date are required' },
        { status: 400 }
      )
    }

    const isTimeEntry = body.type === 'Shift' || !body.type

    const { data, error } = await supabase
      .from('schedule_entries')
      .insert({
        org_id:      orgId,
        employee_id: body.employee_id,
        date:        body.date,
        start_time:  isTimeEntry ? body.start_time : null,
        end_time:    isTimeEntry ? body.end_time   : null,
        job_id:      isTimeEntry ? body.job_id     : null,
        type:        body.type ?? 'Shift',
        notes:       body.notes ?? null,
        published:   body.published ?? false,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
