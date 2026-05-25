import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, handleApiError } from '@/utils/supabase/helpers'

/**
 * PUT /api/timesheets/[id]
 *
 * Update a timesheet — approve, lock, correct hours, or add manager notes.
 *
 * Body: {
 *   action?: 'approve' | 'lock' | 'reopen'
 *   regular_hours?: number
 *   ot_hours?: number
 *   total_cost?: number
 *   manager_notes?: string
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, orgId, userId } = await requireOrg()
    const { id } = await params
    const body = await request.json()

    const updates: Record<string, unknown> = {}

    if (body.action === 'approve') {
      updates.status      = 'approved'
      updates.approved_by = userId
      updates.approved_at = new Date().toISOString()
    } else if (body.action === 'lock') {
      updates.status    = 'locked'
      updates.locked_at = new Date().toISOString()
    } else if (body.action === 'reopen') {
      updates.status      = 'pending'
      updates.approved_by = null
      updates.approved_at = null
      updates.locked_at   = null
    }

    if (body.regular_hours != null) updates.regular_hours = body.regular_hours
    if (body.ot_hours      != null) updates.ot_hours      = body.ot_hours
    if (body.total_cost    != null) updates.total_cost    = body.total_cost
    if (body.manager_notes != null) updates.manager_notes = body.manager_notes

    const { data, error } = await supabase
      .from('timesheets')
      .update(updates)
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
