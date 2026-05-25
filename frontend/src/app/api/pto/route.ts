import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, handleApiError } from '@/utils/supabase/helpers'

// GET /api/pto?status=pending&employee_id=
export async function GET(request: NextRequest) {
  try {
    const { supabase, orgId } = await requireOrg()
    const { searchParams } = new URL(request.url)
    const status     = searchParams.get('status')
    const employeeId = searchParams.get('employee_id')

    let query = supabase
      .from('pto_requests')
      .select(`
        *,
        employee:employees(id, name, badge, department)
      `)
      .eq('org_id', orgId)
      .order('start_date', { ascending: false })

    if (status)     query = query.eq('status', status)
    if (employeeId) query = query.eq('employee_id', employeeId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    return handleApiError(err)
  }
}

// POST /api/pto  — submit a PTO request
export async function POST(request: NextRequest) {
  try {
    const { supabase, orgId } = await requireOrg()
    const body = await request.json()

    if (!body.employee_id || !body.start_date || !body.end_date || !body.type) {
      return NextResponse.json(
        { error: 'employee_id, type, start_date, and end_date are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('pto_requests')
      .insert({
        org_id:      orgId,
        employee_id: body.employee_id,
        type:        body.type,
        start_date:  body.start_date,
        end_date:    body.end_date,
        hours:       body.hours ?? null,
        notes:       body.notes ?? null,
        status:      'pending',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
