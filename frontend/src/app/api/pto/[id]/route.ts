import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, handleApiError } from '@/utils/supabase/helpers'

/**
 * PUT /api/pto/[id]
 *
 * Approve or deny a PTO request.
 * Body: { action: 'approve' | 'deny', manager_notes?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, orgId, userId } = await requireOrg()
    const { id } = await params
    const body = await request.json()

    if (!body.action || !['approve', 'deny'].includes(body.action)) {
      return NextResponse.json(
        { error: 'action must be "approve" or "deny"' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('pto_requests')
      .update({
        status:        body.action === 'approve' ? 'approved' : 'denied',
        manager_notes: body.manager_notes ?? null,
        reviewed_by:   userId,
        reviewed_at:   new Date().toISOString(),
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
