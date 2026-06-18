"use client";

import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { PriorityBadge, StatusBadge } from "@/components/tasks/task-badges";
import { TaskRowActions } from "@/components/tasks/task-row-actions";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatDueDate, cn } from "@/lib/utils";

const DUE_TONE = {
  danger: "text-destructive",
  warning: "text-orange-600 dark:text-orange-400",
  default: "text-foreground",
  muted: "text-muted-foreground",
};

export function TaskTable({ tasks, currentUserId, onEdit, onDelete, onStatusChange }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Due date</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Assignee</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, i) => {
              const due = formatDueDate(task.dueDate);
              return (
                <m.tr
                  key={task.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.025, 0.3) }}
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  className="cursor-pointer border-b transition-colors last:border-0 hover:bg-accent/40"
                >
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate font-medium text-foreground">{task.title}</p>
                    {task.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className={cn("inline-flex items-center gap-1.5 text-xs", DUE_TONE[due.tone])}>
                      <CalendarDays className="h-3.5 w-3.5" />
                      {due.label}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={task.assignedTo} className="h-7 w-7" />
                      <span className="truncate text-xs text-muted-foreground">
                        {task.assignedTo?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <TaskRowActions
                      task={task}
                      currentUserId={currentUserId}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                    />
                  </td>
                </m.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
