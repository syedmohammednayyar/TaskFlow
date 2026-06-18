"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, GripVertical } from "lucide-react";
import { PriorityBadge } from "@/components/tasks/task-badges";
import { TaskRowActions } from "@/components/tasks/task-row-actions";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatDueDate, cn } from "@/lib/utils";

const DUE_TONE = {
  danger: "text-destructive",
  warning: "text-orange-600 dark:text-orange-400",
  default: "text-muted-foreground",
  muted: "text-muted-foreground",
};

/**
 * Presentational task card. `dragHandleProps`/`isDragging` are supplied by
 * the Kanban board's sortable wrapper; omitted everywhere else.
 */
export function TaskCard({
  task,
  currentUserId,
  onEdit,
  onDelete,
  onStatusChange,
  dragHandleProps,
  isDragging,
}) {
  const router = useRouter();
  const due = formatDueDate(task.dueDate);

  return (
    <div
      onClick={() => router.push(`/tasks/${task.id}`)}
      className={cn(
        "group cursor-pointer rounded-xl border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "opacity-60 shadow-lg ring-2 ring-primary"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-1.5">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 cursor-grab text-muted-foreground/50 opacity-0 transition-opacity hover:text-muted-foreground group-hover:opacity-100 active:cursor-grabbing"
              aria-label="Drag task"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {task.title}
          </p>
        </div>
        <TaskRowActions
          task={task}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      </div>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 pl-0 text-xs text-muted-foreground">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={cn("inline-flex items-center gap-1 text-[11px]", DUE_TONE[due.tone])}>
            <CalendarDays className="h-3 w-3" />
            {due.label}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t pt-2.5">
        <UserAvatar user={task.assignedTo} className="h-6 w-6" />
        <span className="truncate text-xs text-muted-foreground">
          {task.assignedTo?.name}
        </span>
      </div>
    </div>
  );
}
