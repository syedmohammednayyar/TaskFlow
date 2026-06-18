"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { m } from "framer-motion";
import {
  ListTodo,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { PriorityBadge, StatusBadge } from "@/components/tasks/task-badges";
import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { useStats, useTasks } from "@/hooks/use-tasks";
import { formatDueDate, cn } from "@/lib/utils";

const DUE_TONE = {
  danger: "text-destructive",
  warning: "text-orange-600 dark:text-orange-400",
  default: "text-muted-foreground",
  muted: "text-muted-foreground",
};

export function DashboardContent({ userName }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const { stats, isLoading: statsLoading, mutate: mutateStats } = useStats();
  const { tasks: recent, isLoading: tasksLoading, mutate: mutateTasks } = useTasks({ scope: "all", limit: 6 });
  const [createOpen, setCreateOpen] = useState(false);

  const cards = [
    { label: "Total Tasks", value: stats?.total ?? 0, icon: ListTodo, tone: "primary" },
    { label: "Assigned to Me", value: stats?.assignedToMe ?? 0, icon: UserCheck, tone: "blue" },
    { label: "Completed", value: stats?.completed ?? 0, icon: CheckCircle2, tone: "emerald" },
    { label: "Overdue", value: stats?.overdue ?? 0, icon: AlertTriangle, tone: "red" },
  ];

  function refresh() {
    mutateStats();
    mutateTasks();
  }

  return (
    <div className="space-y-7">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {userName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your tasks today.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[108px] rounded-2xl" />
            ))
          : cards.map((c, i) => <StatCard key={c.label} index={i} {...c} />)}
      </div>

      {/* Progress overview */}
      {!statsLoading && stats && (
        <ProgressOverview stats={stats} />
      )}

      {/* Recent tasks */}
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Recent tasks</h2>
            <p className="text-xs text-muted-foreground">Your latest activity</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/tasks">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {tasksLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={ListTodo}
              title="No tasks yet"
              description="Create your first task and assign it to a teammate."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" /> Create task
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="divide-y">
            {recent.map((task, i) => {
              const due = formatDueDate(task.dueDate);
              return (
                <m.li
                  key={task.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={`/tasks/${task.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      <p className={cn("text-xs", DUE_TONE[due.tone])}>{due.label}</p>
                    </div>
                    <div className="hidden sm:block">
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <StatusBadge status={task.status} />
                    <UserAvatar user={task.assignedTo} className="h-7 w-7" />
                  </Link>
                </m.li>
              );
            })}
          </ul>
        )}
      </div>

      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        currentUserId={currentUserId}
        onSaved={refresh}
      />
    </div>
  );
}

function ProgressOverview({ stats }) {
  const total = stats.total || 0;
  const segments = [
    { label: "Todo", value: stats.todo || 0, color: "bg-slate-400" },
    { label: "In Progress", value: stats.inProgress || 0, color: "bg-blue-500" },
    { label: "Completed", value: stats.completed || 0, color: "bg-emerald-500" },
  ];
  const pct = (v) => (total > 0 ? (v / total) * 100 : 0);
  const completionRate = total > 0 ? Math.round((stats.completed / total) * 100) : 0;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Progress overview</h2>
        <span className="text-sm font-medium text-muted-foreground">
          {completionRate}% complete
        </span>
      </div>
      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s) => (
          <m.div
            key={s.label}
            className={s.color}
            initial={{ width: 0 }}
            animate={{ width: `${pct(s.value)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className={cn("h-2.5 w-2.5 rounded-full", s.color)} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-semibold">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
