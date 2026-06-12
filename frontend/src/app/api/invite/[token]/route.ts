import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { handleApiError } from '@/utils/supabase/helpers'

/**
 * POST /api/invite/[token]
 *
 * Public endpoint — accepts an employee invite. The token itself is the
 * credential (only the invited employee was given the link), so the new
 * account's email is created pre-confirmed.
 *
 * Body: { first_name: string, last_name: string, password: string }
 *
 * Creates the auth user, links it to the employee record and clears the
 * token. The client then signs in with the email + password normally.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    const firstName = String(body.first_name ?? '').trim()
    const lastName = String(body.last_name ?? '').trim()
    const password = String(body.password ?? '')

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First and last name are required' },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: employee } = await admin
      .from('employees')
      .select('id, org_id, name, email, status, user_id')
      .eq('invite_token', token)
      .single()

    if (!employee || employee.status !== 'Active' || !employee.email) {
      return NextResponse.json(
        { error: 'This invite link is invalid or has expired' },
        { status: 404 }
      )
    }
    if (employee.user_id) {
      return NextResponse.json(
        { error: 'This invite has already been used. Try signing in instead.' },
        { status: 409 }
      )
    }

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: employee.email,
        password,
        email_confirm: true,
        user_metadata: { first_name: firstName, last_name: lastName },
      })

    if (createError || !created.user) {
      const msg = createError?.message ?? 'Could not create account'
      const conflict = /already|registered|exists/i.test(msg)
      return NextResponse.json(
        {
          error: conflict
            ? 'An account with this email already exists. Ask your manager to update your email, or sign in with your existing account.'
            : msg,
        },
        { status: conflict ? 409 : 500 }
      )
    }

    const { error: linkError } = await admin
      .from('employees')
      .update({
        user_id: created.user.id,
        invite_token: null,
        invite_accepted_at: new Date().toISOString(),
      })
      .eq('id', employee.id)

    if (linkError) {
      // Roll back the orphaned auth user so the invite can be retried
      await admin.auth.admin.deleteUser(created.user.id)
      throw linkError
    }

    return NextResponse.json({ ok: true, email: employee.email }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
