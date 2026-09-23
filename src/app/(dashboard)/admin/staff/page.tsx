import { getAdminStaff } from "@/actions/admin";
import { StaffTable } from "@/components/admin/staff-table";

export const metadata = {
  title: "Admin Staff Management",
};

interface AdminStaffPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminStaffPage({
  searchParams,
}: AdminStaffPageProps) {
  const { q, page } = await searchParams;
  const currentPage = Number(page) || 1;
  const data = await getAdminStaff(currentPage, 20, q);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight">Staff</h2>
        <p className="text-muted-foreground">
          Manage Africhina staff members, operational permissions, and accounts.
        </p>
      </div>

      <StaffTable
        staff={data?.staff ?? []}
        pagination={data?.pagination}
        currentSearch={q}
      />
    </div>
  );
}
