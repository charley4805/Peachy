import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import AcceptInviteForm from "./AcceptInviteForm";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const admin = createAdminClient();
  const { data: employee } = await admin
    .from("employees")
    .select("id, name, email, status, user_id, org:organizations(name)")
    .eq("invite_token", token)
    .single();

  const rawOrg = employee?.org;
  const org = (Array.isArray(rawOrg) ? rawOrg[0] : rawOrg) as { name: string } | null;

  const valid =
    !!employee && employee.status === "Active" && !employee.user_id && !!employee.email;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <Image src="/hourglass.png" alt="Daily" width={36} height={36} />
            <span className="text-2xl font-bold text-gray-900">Daily</span>
          </Link>
        </div>

        {valid ? (
          <AcceptInviteForm
            token={token}
            employeeName={employee.name}
            email={employee.email!}
            orgName={org?.name ?? "your company"}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="text-4xl mb-3">🔗</div>
            <h1 className="text-lg font-semibold text-gray-900 mb-2">
              This invite link isn&apos;t valid
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {employee?.user_id
                ? "This invite has already been used. If that was you, just sign in."
                : "The link may have been revoked or replaced. Ask your manager to send you a new one."}
            </p>
            <Link
              href="/auth"
              className="inline-block rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Go to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
