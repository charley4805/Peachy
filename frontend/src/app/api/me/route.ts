import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/utils/supabase/helpers'
import { requireEmployee } from '@/utils/supabase/employee-helpers'

// GET /api/me — the signed-in employee's record + org name
export async function GET() {
  try {
    const { admin, employee } = await requireEmployee()

    const { data: org } = await admin
      .from('organizations')
      .select('name')
      .eq('id', employee.org_id)
      .single()

    return NextResponse.json({ employee, org_name: org?.name ?? null })
  } catch (err) {
    return handleApiError(err)
  }
}

// PUT /api/me — update own contact details (allowlisted fields only)
export async function PUT(request: NextRequest) {
  try {
    const { admin, employee } = await requireEmployee()
    const body = await request.json()

    const updates: Record<string, string | null> = {}
    if ('phone' in body) updates.phone = String(body.phone ?? '').trim() || null
    if ('avatar_url' in body)
      updates.avatar_url = String(body.avatar_url ?? '').trim() || null

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const { data, error } = await admin
      .from('employees')
      .update(updates)
      .eq('id', employee.id)
      .select('id, phone, avatar_url')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    return handleApiError(err)
  }
}
