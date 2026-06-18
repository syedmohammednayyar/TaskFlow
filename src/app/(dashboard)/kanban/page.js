import { TaskWorkspace } from "@/components/tasks/task-workspace";

export const metadata = { title: "Kanban Board" };

export default function KanbanPage() {
  return (
    <TaskWorkspace
      scope="all"
      title="Kanban Board"
      description="Drag tasks across columns to update their status."
      views={["kanban", "list"]}
      defaultView="kanban"
      emptyTitle="Your board is empty"
      emptyDescription="Create a task and drag it through your workflow."
    />
  );
}
