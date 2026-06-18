"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { m } from "framer-motion";
import { TaskCard } from "@/components/tasks/task-card";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { id: "Todo", title: "Todo", accent: "bg-slate-400" },
  { id: "In Progress", title: "In Progress", accent: "bg-blue-500" },
  { id: "Completed", title: "Completed", accent: "bg-emerald-500" },
];

function SortableTaskCard({ task, ...handlers }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        {...handlers}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function Column({ column, tasks, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex min-w-[280px] flex-1 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={cn("h-2.5 w-2.5 rounded-full", column.accent)} />
        <h3 className="text-sm font-semibold">{column.title}</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[200px] flex-1 flex-col gap-2.5 rounded-2xl border border-dashed bg-muted/30 p-2.5 transition-colors",
          isOver && "border-primary bg-accent/40"
        )}
      >
        {children}
        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-8 text-center text-xs text-muted-foreground">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, currentUserId, onEdit, onDelete, onStatusChange }) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } })
  );

  const grouped = useMemo(() => {
    const map = { Todo: [], "In Progress": [], Completed: [] };
    for (const t of tasks) (map[t.status] || map.Todo).push(t);
    return map;
  }, [tasks]);

  function handleDragStart(event) {
    setActiveTask(event.active.data.current?.task || null);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const task = active.data.current?.task;
    if (!task) return;

    // The drop target is either a column id or another card; resolve to a status.
    const overData = over.data.current;
    const targetStatus = COLUMNS.some((c) => c.id === over.id)
      ? over.id
      : overData?.task?.status;

    if (targetStatus && targetStatus !== task.status) {
      onStatusChange?.(task, targetStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="flex flex-col gap-4 overflow-x-auto pb-2 lg:flex-row lg:items-start">
        {COLUMNS.map((column) => {
          const columnTasks = grouped[column.id] || [];
          return (
            <Column key={column.id} column={column} tasks={columnTasks}>
              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {columnTasks.map((task) => (
                  <m.div key={task.id} layout>
                    <SortableTaskCard
                      task={task}
                      currentUserId={currentUserId}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                    />
                  </m.div>
                ))}
              </SortableContext>
            </Column>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-[270px] rotate-2">
            <TaskCard task={activeTask} currentUserId={currentUserId} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
