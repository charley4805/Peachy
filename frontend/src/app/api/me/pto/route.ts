import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/utils/supabase/helpers'
import { requireEmployee } from '@/utils/supabase/employee-helpers'

const PTO_TYPES = ['PTO', 'Vacation', 'Holiday', 'Sick']

// GET /api/me/pto — own requests + balance for the current year
export async function GET() {
  try {
    const { admin, employee } = await requireEmployee()

    const yearStart = `${new Date().getFullYear()}-01-01`

    const { data: requests, error } = await admin
      .from('pto_requests')
      .select('id, type, start_date, end_date, hours, status, notes, manager_notes, created_at')
      .eq('employee_id', employee.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    let usedHours = 0
    let pendingHours = 0
    for (const r of requests ?? []) {
      if (r.end_date < yearStart) continue
      if (r.status === 'approved') usedHours += Number(r.hours) || 0
      if (r.status === 'pending') pendingHours += Number(r.hours) || 0
    }

    return NextResponse.json({
      requests: requests ?? [],
      balance: {
        allowance_hours: Number(employee.pto_allowance_hours) || 0,
        used_hours: usedHours,
        pending_hours: pendingHours,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

// POST /api/me/pto — submit a time-off request
export async function POST(request: NextRequest) {
  try {
    const { admin, employee } = await requireEmployee()
    const body = await request.json()

    const type = String(body.type ?? '')
    const startDate = String(body.start_date ?? '')
    const endDate = String(body.end_date ?? '')
    const hours = Number(body.hours)

    if (!PTO_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${PTO_TYPES.join(', ')}` },
        { status: 400 }
      )
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return NextResponse.json(
        { error: 'start_date and end_date are required (YYYY-MM-DD)' },
        { status: 400 }
      )
    }
    if (endDate < startDate) {
      return NextResponse.json(
        { error: 'end_date must be on or after start_date' },
        { status: 400 }
      )
    }
    if (!Number.isFinite(hours) || hours <= 0) {
      return NextResponse.json(
        { error: 'hours must be a positive number' },
        { status: 400 }
      )
    }

    const { data, error } = await admin
      .from('pto_requests')
      .insert({
        org_id:      employee.org_id,
        employee_id: employee.id,
        type,
        start_date:  startDate,
        end_date:    endDate,
        hours,
        status:      'pending',
        notes:       body.notes?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
