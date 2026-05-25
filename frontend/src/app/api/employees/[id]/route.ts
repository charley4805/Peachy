import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, handleApiError } from '@/utils/supabase/helpers'

// PUT /api/employees/[id]  — update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, orgId } = await requireOrg()
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase
      .from('employees')
      .update({
        name:       body.name?.trim(),
        role:       body.role,
        department: body.department,
        pay_type:   body.payType,
        pay_rate:   body.payRate,
        pay_unit:   body.payUnit,
        email:      body.email?.trim() ?? null,
        phone:      body.phone?.trim() ?? null,
        status:     body.status,
        hire_date:  body.hireDate,
      })
      .eq('id', id)
      .eq('org_id', orgId)   // RLS safety: ensure record belongs to org
      .select()
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(data)
  } catch (err) {
    return handleApiError(err)
  }
}

// DELETE /api/employees/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, orgId } = await requireOrg()
    const { id } = await params

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
