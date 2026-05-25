import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, handleApiError } from '@/utils/supabase/helpers'

// PUT /api/schedule/[id]  — move or edit an entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, orgId } = await requireOrg()
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase
      .from('schedule_entries')
      .update({
        employee_id: body.employee_id,
        date:        body.date,
        start_time:  body.start_time ?? null,
        end_time:    body.end_time   ?? null,
        job_id:      body.job_id     ?? null,
        type:        body.type,
        notes:       body.notes      ?? null,
        published:   body.published,
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(data)
  } catch (err) {
    return handleApiError(err)
  }
}

// DELETE /api/schedule/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, orgId } = await requireOrg()
    const { id } = await params

    const { error } = await supabase
      .from('schedule_entries')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
