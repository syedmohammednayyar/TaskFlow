"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { m } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  MessageSquare,
  Send,
  X,
  Activity as ActivityIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriorityBadge, StatusBadge } from "@/components/tasks/task-badges";
import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { useTask } from "@/hooks/use-tasks";
import { useComments } from "@/hooks/use-comments";
import { useActivity } from "@/hooks/use-activity";
import { apiFetch } from "@/lib/client";
import { formatDate, formatDueDate, formatRelative, cn } from "@/lib/utils";
import { STATUSES } from "@/lib/validations";

const DUE_TONE = {
  danger: "text-destructive",
  warning: "text-orange-600 dark:text-orange-400",
  default: "text-foreground",
  muted: "text-muted-foreground",
};

export function TaskDetail({ id }) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const { task, isLoading, isError, error, mutate } = useTask(id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !task) {
    const is404 = error?.status === 404 || error?.status === 403;
    return (
      <div className="mx-auto max-w-2xl">
        <BackButton />
        <EmptyState
          icon={CheckCircle2}
          title={is404 ? "Task not found" : "Couldn't load this task"}
          description={
            is404
              ? "This task may have been deleted or you don't have access to it."
              : "Please try again in a moment."
          }
          action={
            <Button variant="outline" onClick={() => router.push("/tasks")}>
              Back to tasks
            </Button>
          }
        />
      </div>
    );
  }

  const isCreator = task.createdBy?.id === currentUserId;
  const due = formatDueDate(task.dueDate);

  async function changeStatus(status) {
    if (status === task.status) return;
    setSavingStatus(true);
    mutate({ ...task, status }, false);
    try {
      await apiFetch(`/api/tasks/${task.id}`, { method: "PATCH", body: { status } });
      toast.success(`Moved to ${status}`);
    } catch (err) {
      toast.error(err.message || "Could not update status");
    } finally {
      setSavingStatus(false);
      mutate();
    }
  }

  async function handleDelete() {
    try {
      await apiFetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      toast.success("Task deleted");
      router.push("/tasks");
    } catch (err) {
      toast.error(err.message || "Could not delete task");
    }
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-3xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <BackButton />
        {isCreator && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {/* Header */}
        <div className="border-b p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Created {formatRelative(task.createdAt)}
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <> · updated {formatRelative(task.updatedAt)}</>
            )}
          </p>
        </div>

        {/* Body */}
        <div className="grid gap-6 p-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Description</h2>
            {task.description ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {task.description}
              </p>
            ) : (
              <p className="mt-2 text-sm italic text-muted-foreground">
                No description provided.
              </p>
            )}

            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                Update status
              </h2>
              <Select value={task.status} onValueChange={changeStatus} disabled={savingStatus}>
                <SelectTrigger className="w-full max-w-xs">
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

          {/* Sidebar meta */}
          <div className="space-y-5 rounded-xl border bg-muted/30 p-4">
            <Meta label="Assigned to">
              <div className="flex items-center gap-2">
                <UserAvatar user={task.assignedTo} className="h-8 w-8" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.assignedTo?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {task.assignedTo?.email}
                  </p>
                </div>
              </div>
            </Meta>

            <Meta label="Created by">
              <div className="flex items-center gap-2">
                <UserAvatar user={task.createdBy} className="h-8 w-8" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.createdBy?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {task.createdBy?.email}
                  </p>
                </div>
              </div>
            </Meta>

            <Meta label="Due date">
              <span className={cn("inline-flex items-center gap-1.5 text-sm", DUE_TONE[due.tone])}>
                <CalendarDays className="h-4 w-4" />
                {due.label}
              </span>
            </Meta>

            <Meta label="Created">
              <span className="inline-flex items-center gap-1.5 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {formatDate(task.createdAt)}
              </span>
            </Meta>
          </div>
        </div>
      </div>

      <ActivityTimeline taskId={task.id} />
      <CommentsSection taskId={task.id} currentUserId={currentUserId} />

      <TaskFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        task={task}
        currentUserId={currentUserId}
        onSaved={(updated) => mutate(updated, false)}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this task?"
        description={`"${task.title}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </m.div>
  );
}

function BackButton() {
  const router = useRouter();
  return (
    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => router.back()}>
      <ArrowLeft className="h-4 w-4" /> Back
    </Button>
  );
}

function Meta({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

const ACTIVITY_LABELS = {
  task_created: "created this task",
  task_updated: "updated this task",
  status_changed: (m) => `changed status from ${m.from} to ${m.to}`,
  priority_changed: (m) => `changed priority to ${m.to}`,
  assignment_changed: "reassigned this task",
  task_completed: "marked this task completed",
  task_reopened: "reopened this task",
  task_archived: "archived this task",
  comment_added: "added a comment",
};

function activityLabel(type, metadata) {
  const v = ACTIVITY_LABELS[type];
  if (!v) return type.replace(/_/g, " ");
  return typeof v === "function" ? v(metadata || {}) : v;
}

function ActivityTimeline({ taskId }) {
  const { activities, isLoading } = useActivity(taskId);

  return (
    <div className="mt-6 rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <ActivityIcon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-base font-semibold">Activity</h2>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              <Skeleton className="h-4 w-56" />
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <ul className="divide-y">
          {activities.map((a) => (
            <li key={a.id} className="flex items-start gap-3 px-5 py-3">
              <UserAvatar user={a.actor} className="h-6 w-6 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 text-sm">
                <span className="font-medium">{a.actor?.name}</span>{" "}
                <span className="text-muted-foreground">{activityLabel(a.type, a.metadata)}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                {formatRelative(a.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CommentsSection({ taskId, currentUserId }) {
  const { comments, isLoading, mutate } = useComments(taskId);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editBody, setEditBody] = useState("");
  const textareaRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        body: { body: body.trim() },
      });
      setBody("");
      mutate();
    } catch (err) {
      toast.error(err.message || "Could not post comment");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(commentId) {
    if (!editBody.trim()) return;
    try {
      await apiFetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        body: { body: editBody.trim() },
      });
      setEditId(null);
      mutate();
    } catch (err) {
      toast.error(err.message || "Could not update comment");
    }
  }

  async function handleDelete(commentId) {
    try {
      await apiFetch(`/api/comments/${commentId}`, { method: "DELETE" });
      mutate();
    } catch (err) {
      toast.error(err.message || "Could not delete comment");
    }
  }

  return (
    <div className="mt-6 rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-base font-semibold">Comments</h2>
        {!isLoading && (
          <span className="text-sm text-muted-foreground">({comments.length})</span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <ul className="divide-y">
          {comments.map((comment) => {
            const isMine = comment.author?.id === currentUserId;
            const isEditing = editId === comment.id;
            return (
              <li key={comment.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <UserAvatar user={comment.author} className="h-8 w-8 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-medium">{comment.author?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(comment.createdAt)}
                      </span>
                      {comment.editedAt && (
                        <span className="text-xs italic text-muted-foreground">(edited)</span>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          rows={3}
                          className="text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEdit(comment.id)}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditId(null); setEditBody(""); }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm whitespace-pre-wrap">{comment.body}</p>
                    )}
                  </div>
                  {isMine && !isEditing && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => { setEditId(comment.id); setEditBody(comment.body); }}
                        className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Edit comment"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Delete comment"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="border-t p-5">
        <Textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          rows={3}
          className="text-sm resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e);
          }}
        />
        <div className="mt-2 flex justify-end">
          <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
            <Send className="h-3.5 w-3.5" />
            {submitting ? "Posting…" : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl">
      <Skeleton className="mb-5 h-9 w-20" />
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="space-y-3 border-b p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-3/4" />
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
