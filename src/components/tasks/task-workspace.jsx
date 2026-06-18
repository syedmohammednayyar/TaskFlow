"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AnimatePresence, m } from "framer-motion";
import { Plus, LayoutList, KanbanSquare, ListTodo, SearchX, Inbox, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskTable } from "@/components/tasks/task-table";
import { TableSkeleton, KanbanSkeleton } from "@/components/tasks/task-skeletons";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import dynamic from "next/dynamic";

const KanbanBoard = dynamic(
  () => import("@/components/tasks/kanban-board").then((mod) => mod.KanbanBoard),
  { ssr: false, loading: () => <KanbanSkeleton /> }
);
import { useTasks } from "@/hooks/use-tasks";
import { useDebounce } from "@/hooks/use-debounce";
import { apiFetch } from "@/lib/client";

const DEFAULT_FILTERS = { q: "", status: "All", priority: "All" };

/**
 * Orchestrates a task view: fetching, filters, view switching and CRUD.
 *
 * @param scope         "all" | "mine" | "assigned"
 * @param title         page title
 * @param description   page subtitle
 * @param views         which views to expose: ["list","kanban"]
 * @param defaultView   initial view
 * @param emptyTitle    empty-state title when there are zero tasks
 */
export function TaskWorkspace({
  scope = "all",
  title,
  description,
  views = ["list", "kanban"],
  defaultView = "list",
  initialQuery = "",
  emptyTitle = "No tasks yet",
  emptyDescription = "Create your first task to get started.",
}) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, q: initialQuery });
  const [view, setView] = useState(defaultView);
  const [limit, setLimit] = useState(50);
  const debouncedQ = useDebounce(filters.q, 350);

  const { tasks, hasMore, isLoading, mutate } = useTasks({
    scope,
    status: filters.status,
    priority: filters.priority,
    q: debouncedQ,
    limit,
  });

  // Dialog / confirm state.
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);

  const isFiltering =
    debouncedQ.length > 0 || filters.status !== "All" || filters.priority !== "All";

  function updateFilters(patch) {
    setFilters((f) => ({ ...f, ...patch }));
    setLimit(50);
  }

  async function handleStatusChange(task, status) {
    if (task.status === status) return;
    // Optimistic update.
    mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          items: current.items.map((t) => (t.id === task.id ? { ...t, status } : t)),
        };
      },
      false
    );
    try {
      await apiFetch(`/api/tasks/${task.id}`, { method: "PATCH", body: { status } });
      toast.success(`Moved to ${status}`);
    } catch (err) {
      toast.error(err.message || "Could not update status");
    } finally {
      mutate();
    }
  }

  async function handleDelete() {
    if (!deleteTask) return;
    try {
      await apiFetch(`/api/tasks/${deleteTask.id}`, { method: "DELETE" });
      toast.success("Task deleted");
      mutate();
    } catch (err) {
      toast.error(err.message || "Could not delete task");
    }
  }

  const handlers = {
    currentUserId,
    onEdit: (t) => setEditTask(t),
    onDelete: (t) => setDeleteTask(t),
    onStatusChange: handleStatusChange,
  };

  const showKanban = view === "kanban" && views.includes("kanban");

  return (
    <div>
      <PageHeader title={title} description={description}>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </PageHeader>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <TaskFilters
            filters={filters}
            onChange={updateFilters}
            onClear={() => setFilters(DEFAULT_FILTERS)}
          />
        </div>
        {views.length > 1 && (
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              {views.includes("list") && (
                <TabsTrigger value="list" className="gap-1.5">
                  <LayoutList className="h-4 w-4" /> List
                </TabsTrigger>
              )}
              {views.includes("kanban") && (
                <TabsTrigger value="kanban" className="gap-1.5">
                  <KanbanSquare className="h-4 w-4" /> Board
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        )}
      </div>

      {isLoading ? (
        showKanban ? (
          <KanbanSkeleton />
        ) : (
          <TableSkeleton />
        )
      ) : tasks.length === 0 ? (
        isFiltering ? (
          <EmptyState
            icon={SearchX}
            title="No matching tasks"
            description="Try adjusting your search or filters."
            action={
              <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={scope === "assigned" ? Inbox : ListTodo}
            title={emptyTitle}
            description={emptyDescription}
            action={
              scope !== "assigned" && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" /> Create task
                </Button>
              )
            }
          />
        )
      ) : (
        <AnimatePresence mode="wait">
          <m.div
            key={showKanban ? "kanban" : "list"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {showKanban ? (
              <KanbanBoard tasks={tasks} {...handlers} />
            ) : (
              <TaskTable tasks={tasks} {...handlers} />
            )}
          </m.div>
        </AnimatePresence>
      )}

      {/* Load more */}
      {!isLoading && hasMore && !showKanban && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setLimit((l) => l + 50)}>
            <ChevronDown className="h-4 w-4" /> Load more
          </Button>
        </div>
      )}

      {/* Create */}
      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        currentUserId={currentUserId}
        onSaved={() => mutate()}
      />

      {/* Edit */}
      <TaskFormDialog
        open={!!editTask}
        onOpenChange={(open) => !open && setEditTask(null)}
        task={editTask}
        currentUserId={currentUserId}
        onSaved={() => mutate()}
      />

      {/* Delete */}
      <ConfirmDialog
        open={!!deleteTask}
        onOpenChange={(open) => !open && setDeleteTask(null)}
        title="Delete this task?"
        description={
          deleteTask
            ? `"${deleteTask.title}" will be permanently removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
