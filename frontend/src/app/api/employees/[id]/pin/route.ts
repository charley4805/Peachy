import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, handleApiError } from '@/utils/supabase/helpers'
import { createAdminClient } from '@/utils/supabase/admin'
import { hashPin } from '@/app/api/portal/login/route'

/**
 * PUT /api/employees/[id]/pin
 *
 * Set or reset an employee's portal PIN.
 * Only org admins can call this route.
 *
 * Body: { pin: string }  — 4-8 digit PIN
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId } = await requireOrg()
    const { id } = await params
    const body = await request.json()

    const pin = String(body.pin ?? '').trim()
    if (!/^\d{4,8}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be 4–8 digits' },
        { status: 400 }
      )
    }

    // Verify the employee belongs to this org using admin client
    const admin = createAdminClient()
    const { data: employee } = await admin
      .from('employees')
      .select('id, org_id')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    const pinHash = hashPin(pin)

    const { error } = await admin
      .from('employee_pins')
      .upsert(
        { employee_id: id, pin_hash: pinHash },
        { onConflict: 'employee_id' }
      )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
