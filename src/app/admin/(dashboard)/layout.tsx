import { requireAdmin } from "@/lib/supabase/admin";
import { AdminShell } from "@/components/admin/shell";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();
  return (
    <AdminShell email={user.email || "Administrator"}>{children}</AdminShell>
  );
}
