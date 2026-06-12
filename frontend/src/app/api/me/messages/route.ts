import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/utils/supabase/helpers'
import { requireEmployee, type EmployeeContext } from '@/utils/supabase/employee-helpers'

/**
 * Channel access rules for employees:
 *  - 'announcements'        read for everyone; post only for Manager/Admin
 *  - 'job:{job_id}'         read/write for active org jobs (crew chat)
 *  - 'dm:{own employee id}' read/write — their direct line to management
 */
async function resolveChannel(
  ctx: EmployeeContext,
  channel: string
): Promise<{ ok: boolean; canPost: boolean }> {
  const { admin, employee } = ctx

  if (channel === 'announcements') {
    return { ok: true, canPost: ['Manager', 'Admin'].includes(employee.role) }
  }
  if (channel === `dm:${employee.id}`) {
    return { ok: true, canPost: true }
  }
  if (channel.startsWith('job:')) {
    const jobId = channel.slice(4)
    const { data: job } = await admin
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('org_id', employee.org_id)
      .single()
    return { ok: !!job, canPost: !!job }
  }
  return { ok: false, canPost: false }
}

// GET /api/me/messages?channel=
export async function GET(request: NextRequest) {
  try {
    const ctx = await requireEmployee()
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel') ?? ''

    const access = await resolveChannel(ctx, channel)
    if (!access.ok) {
      return NextResponse.json({ error: 'Unknown channel' }, { status: 404 })
    }

    const { data, error } = await ctx.admin
      .from('messages')
      .select('id, channel, sender_type, sender_id, sender_name, body, created_at')
      .eq('org_id', ctx.employee.org_id)
      .eq('channel', channel)
      .order('created_at', { ascending: true })
      .limit(200)

    if (error) throw error
    return NextResponse.json({ messages: data ?? [], can_post: access.canPost })
  } catch (err) {
    return handleApiError(err)
  }
}

// POST /api/me/messages — { channel, body }
export async function POST(request: NextRequest) {
  try {
    const ctx = await requireEmployee()
    const payload = await request.json()
    const channel = String(payload.channel ?? '')
    const body = String(payload.body ?? '').trim()

    if (!body) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 })
    }
    if (body.length > 4000) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
    }

    const access = await resolveChannel(ctx, channel)
    if (!access.ok) {
      return NextResponse.json({ error: 'Unknown channel' }, { status: 404 })
    }
    if (!access.canPost) {
      return NextResponse.json(
        { error: 'You cannot post in this channel' },
        { status: 403 }
      )
    }

    const { data, error } = await ctx.admin
      .from('messages')
      .insert({
        org_id:      ctx.employee.org_id,
        channel,
        sender_type: 'employee',
        sender_id:   ctx.employee.id,
        sender_name: ctx.employee.name,
        body,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
