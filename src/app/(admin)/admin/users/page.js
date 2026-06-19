import { UsersTable } from "@/components/admin/users-table";

export const metadata = { title: "Users — Admin" };

export default function AdminUsersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all registered accounts — edit details, reset passwords, or remove users.
        </p>
      </div>
      <UsersTable />
    </div>
  );
}
