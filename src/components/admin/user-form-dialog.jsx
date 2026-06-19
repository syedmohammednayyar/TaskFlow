"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMPTY_CREATE = { name: "", email: "", password: "", role: "member" };

function Field({ label, id, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function UserFormDialog({ open, user, onClose, onSaved }) {
  const isEdit = !!user;

  const [values, setValues] = useState(EMPTY_CREATE);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (user) {
      setValues({ name: user.name, email: user.email, password: "", role: user.role, isActive: user.isActive });
    } else {
      setValues(EMPTY_CREATE);
    }
    setErrors({});
  }, [user, open]);

  const set = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((v) => ({ ...v, [key]: val }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const url = isEdit ? `/api/admin/users/${user.id}` : "/api/admin/users";
    const method = isEdit ? "PATCH" : "POST";

    // For edit: only send fields that changed; omit blank password
    const body = isEdit
      ? {
          ...(values.name !== user.name && { name: values.name }),
          ...(values.email !== user.email && { email: values.email }),
          ...(values.role !== user.role && { role: values.role }),
          ...(values.isActive !== user.isActive && { isActive: values.isActive }),
          ...(values.password && { password: values.password }),
        }
      : values;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!json.success) {
        if (json.errors) setErrors(json.errors);
        toast.error(json.message || "Something went wrong");
        return;
      }

      toast.success(isEdit ? "User updated" : "User created");
      onSaved();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold">
              {isEdit ? "Edit User" : "Add User"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-md p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Full name" id="name" error={errors.name}>
              <Input
                id="name"
                placeholder="Jane Doe"
                value={values.name}
                onChange={set("name")}
                aria-invalid={!!errors.name}
              />
            </Field>

            <Field label="Email" id="email" error={errors.email}>
              <Input
                id="email"
                type="email"
                placeholder="jane@company.com"
                value={values.email}
                onChange={set("email")}
                aria-invalid={!!errors.email}
              />
            </Field>

            <Field
              label={isEdit ? "New password (leave blank to keep current)" : "Password"}
              id="password"
              error={errors.password}
            >
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder={isEdit ? "Enter new password…" : "At least 8 characters"}
                  value={values.password}
                  onChange={set("password")}
                  aria-invalid={!!errors.password}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Field label="Role" id="role" error={errors.role}>
              <select
                id="role"
                value={values.role}
                onChange={set("role")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </Field>

            {isEdit && (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={values.isActive ?? true}
                  onChange={set("isActive")}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <div>
                  <Label htmlFor="isActive" className="cursor-pointer">Active account</Label>
                  <p className="text-xs text-muted-foreground">Unchecking this blocks the user from logging in</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {loading ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save changes" : "Create user")}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
