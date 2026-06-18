"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useUsers } from "@/hooks/use-tasks";
import { apiFetch } from "@/lib/client";
import { taskSchema, formatZodError, PRIORITIES, STATUSES } from "@/lib/validations";

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function blankForm(currentUserId) {
  return {
    title: "",
    description: "",
    priority: "Medium",
    status: "Todo",
    dueDate: "",
    assignedTo: currentUserId || "",
  };
}

/**
 * Create / edit task dialog. Pass `task` to edit, omit to create.
 */
export function TaskFormDialog({ open, onOpenChange, task, currentUserId, onSaved }) {
  const isEdit = !!task;
  const { users, isLoading: usersLoading } = useUsers();

  const [form, setForm] = useState(blankForm(currentUserId));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form whenever the dialog opens (for either mode).
  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        status: task.status || "Todo",
        dueDate: toDateInput(task.dueDate),
        assignedTo: task.assignedTo?.id || currentUserId || "",
      });
    } else {
      setForm(blankForm(currentUserId));
    }
  }, [open, task, currentUserId]);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const selectedUser = useMemo(
    () => users.find((u) => u.id === form.assignedTo),
    [users, form.assignedTo]
  );

  async function onSubmit(e) {
    e.preventDefault();
    const payload = { ...form, description: form.description?.trim() || "" };
    const parsed = taskSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(formatZodError(parsed.error));
      return;
    }

    setLoading(true);
    try {
      const body = {
        ...parsed.data,
        dueDate: parsed.data.dueDate || null,
      };
      const saved = isEdit
        ? await apiFetch(`/api/tasks/${task.id}`, { method: "PATCH", body })
        : await apiFetch("/api/tasks", { method: "POST", body });

      toast.success(isEdit ? "Task updated" : "Task created");
      onOpenChange(false);
      onSaved?.(saved);
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors);
      toast.error(err.message || "Could not save the task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "Create a task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details and reassign if needed."
              : "Add a task and assign it to a teammate."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title")(e.target.value)}
              placeholder="e.g. Design the onboarding flow"
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder="Add any helpful context…"
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={set("priority")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate")(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Assign to</Label>
              <Select value={form.assignedTo} onValueChange={set("assignedTo")}>
                <SelectTrigger aria-invalid={!!errors.assignedTo}>
                  <SelectValue placeholder={usersLoading ? "Loading…" : "Select a user"}>
                    {selectedUser && (
                      <span className="flex items-center gap-2">
                        <UserAvatar user={selectedUser} className="h-5 w-5" />
                        <span className="truncate">{selectedUser.name}</span>
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      <span className="flex items-center gap-2">
                        <UserAvatar user={u} className="h-5 w-5" />
                        <span className="truncate">{u.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedTo && (
                <p className="text-xs text-destructive">{errors.assignedTo}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {isEdit ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
