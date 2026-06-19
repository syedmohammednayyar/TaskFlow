"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { format } from "date-fns";
import { MoreHorizontal, Plus, Pencil, Trash2, ShieldCheck, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserFormDialog } from "@/components/admin/user-form-dialog";
import { cn, getInitials } from "@/lib/utils";

const fetcher = (url) => fetch(url).then((r) => r.json()).then((r) => r.data);

function RoleBadge({ role }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        role === "admin"
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      )}
    >
      {role === "admin" && <ShieldCheck className="h-3 w-3" />}
      {role}
    </span>
  );
}

function StatusBadge({ isActive }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        isActive
          ? "bg-green-500/10 text-green-700 dark:text-green-400"
          : "bg-destructive/10 text-destructive"
      )}
    >
      {isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function Avatar({ user }) {
  const [imgError, setImgError] = useState(false);
  if (user.avatar && !imgError) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        onError={() => setImgError(true)}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {getInitials(user.name)}
    </div>
  );
}

export function UsersTable() {
  const { data: users, mutate, isLoading } = useSWR("/api/admin/users", fetcher);

  const [editTarget, setEditTarget] = useState(null);   // user to edit
  const [createOpen, setCreateOpen] = useState(false);  // create dialog
  const [deleting, setDeleting] = useState(null);       // user id being deleted
  const [menuOpen, setMenuOpen] = useState(null);       // row action menu

  async function handleDelete(user) {
    if (!confirm(`Delete "${user.name}"? This cannot be undone.`)) return;
    setDeleting(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message || "Could not delete user");
      } else {
        toast.success(`${user.name} has been removed`);
        mutate();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  function onSaved() {
    mutate();
    setEditTarget(null);
    setCreateOpen(false);
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground animate-pulse">
        Loading users…
      </div>
    );
  }

  if (!users) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center text-sm text-destructive">
        Failed to load users. Refresh the page.
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {users.length} {users.length === 1 ? "user" : "users"} total
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Login</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tasks</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                  <td className="px-4 py-3"><StatusBadge isActive={user.isActive} /></td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.lastLogin ? format(new Date(user.lastLogin), "MMM d, yyyy") : "Never"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {user._count.tasksCreated}c / {user._count.tasksAssigned}a
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative flex justify-end">
                      <button
                        onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                        className="rounded-md p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuOpen === user.id && (
                        <>
                          {/* Backdrop */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpen(null)}
                          />
                          <div className="absolute right-0 top-8 z-20 w-36 rounded-lg border bg-popover shadow-md py-1">
                            <button
                              onClick={() => { setEditTarget(user); setMenuOpen(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => { setMenuOpen(null); handleDelete(user); }}
                              disabled={deleting === user.id}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {deleting === user.id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      <UserFormDialog
        open={!!editTarget}
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={onSaved}
      />
      <UserFormDialog
        open={createOpen}
        user={null}
        onClose={() => setCreateOpen(false)}
        onSaved={onSaved}
      />
    </>
  );
}
