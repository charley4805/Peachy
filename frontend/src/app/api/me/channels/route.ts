import { NextResponse } from 'next/server'
import { handleApiError } from '@/utils/supabase/helpers'
import { requireEmployee } from '@/utils/supabase/employee-helpers'

// GET /api/me/channels — chat channels available to this employee
export async function GET() {
  try {
    const { admin, employee } = await requireEmployee()

    const { data: jobs } = await admin
      .from('jobs')
      .select('id, name, customer')
      .eq('org_id', employee.org_id)
      .eq('status', 'active')
      .order('name')

    const canPostAnnouncements = ['Manager', 'Admin'].includes(employee.role)

    return NextResponse.json({
      org_id: employee.org_id,
      channels: [
        {
          id: 'announcements',
          type: 'announcements',
          name: 'Announcements',
          description: canPostAnnouncements
            ? 'Company-wide updates'
            : 'Company-wide updates (read-only)',
          can_post: canPostAnnouncements,
        },
        ...(jobs ?? []).map((j) => ({
          id: `job:${j.id}`,
          type: 'job',
          name: j.name,
          description: j.customer,
          can_post: true,
        })),
        {
          id: `dm:${employee.id}`,
          type: 'dm',
          name: 'Management',
          description: 'Your direct line to the office',
          can_post: true,
        },
      ],
    })
  } catch (err) {
    return handleApiError(err)
  }
}
