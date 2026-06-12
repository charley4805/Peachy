import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, handleApiError } from '@/utils/supabase/helpers'
import { randomBytes } from 'crypto'

/**
 * POST /api/employees/[id]/invite
 *
 * Generates (or regenerates) a one-time invite link the employee can use
 * to create their own account at /invite/[token]. Requires the employee
 * to have an email on file — it becomes their sign-in email.
 *
 * Returns: { invite_url, token }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, orgId } = await requireOrg()
    const { id } = await params

    const { data: employee } = await supabase
      .from('employees')
      .select('id, email, status, user_id')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }
    if (employee.user_id) {
      return NextResponse.json(
        { error: 'This employee already has an account' },
        { status: 409 }
      )
    }
    if (!employee.email?.trim()) {
      return NextResponse.json(
        { error: 'Add an email address to this employee before inviting them' },
        { status: 400 }
      )
    }
    if (employee.status !== 'Active') {
      return NextResponse.json(
        { error: 'Only active employees can be invited' },
        { status: 400 }
      )
    }

    const token = randomBytes(24).toString('base64url')

    const { error } = await supabase
      .from('employees')
      .update({ invite_token: token, invite_sent_at: new Date().toISOString() })
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error

    const origin = new URL(request.url).origin
    return NextResponse.json(
      { invite_url: `${origin}/invite/${token}`, token },
      { status: 201 }
    )
  } catch (err) {
    return handleApiError(err)
  }
}

// DELETE /api/employees/[id]/invite — revoke a pending invite link
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, orgId } = await requireOrg()
    const { id } = await params

    const { error } = await supabase
      .from('employees')
      .update({ invite_token: null, invite_sent_at: null })
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleApiError(err)
  }
}
