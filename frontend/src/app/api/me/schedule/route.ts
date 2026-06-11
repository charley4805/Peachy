import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/utils/supabase/helpers'
import { requireEmployee } from '@/utils/supabase/employee-helpers'

// GET /api/me/schedule?start=YYYY-MM-DD&end=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const { admin, employee } = await requireEmployee()
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return NextResponse.json(
        { error: 'start and end are required (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    const { data, error } = await admin
      .from('schedule_entries')
      .select('id, date, start_time, end_time, type, notes, job:jobs(id, name, customer, color)')
      .eq('employee_id', employee.id)
      .gte('date', start)
      .lte('date', end)
      .order('date')
      .order('start_time')

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (err) {
    return handleApiError(err)
  }
}
