import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, handleApiError } from '@/utils/supabase/helpers'

// GET /api/employees?search=&status=&department=
export async function GET(request: NextRequest) {
  try {
    const { supabase, orgId } = await requireOrg()
    const { searchParams } = new URL(request.url)
    const search     = searchParams.get('search') ?? ''
    const status     = searchParams.get('status') ?? ''
    const department = searchParams.get('department') ?? ''

    let query = supabase
      .from('employees')
      .select('*')
      .eq('org_id', orgId)
      .order('name')

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,badge.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }
    if (status)     query = query.eq('status', status)
    if (department) query = query.eq('department', department)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    return handleApiError(err)
  }
}

// POST /api/employees  — create a new employee
export async function POST(request: NextRequest) {
  try {
    const { supabase, orgId } = await requireOrg()
    const body = await request.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Auto-generate badge number (next available in org)
    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)

    const badgeNum = 1000 + (count ?? 0) + 1

    const { data, error } = await supabase
      .from('employees')
      .insert({
        org_id:     orgId,
        name:       body.name.trim(),
        badge:      body.badge ?? `EMP-${badgeNum}`,
        role:       body.role       ?? 'Employee',
        department: body.department ?? null,
        pay_type:   body.payType    ?? 'Hourly',
        pay_rate:   body.payRate    ?? null,
        pay_unit:   body.payUnit    ?? 'hr',
        email:      body.email?.trim() ?? null,
        phone:      body.phone?.trim() ?? null,
        hire_date:  body.hireDate   ?? new Date().toISOString().slice(0, 10),
        status:     'Active',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
