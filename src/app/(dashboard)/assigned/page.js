import { TaskWorkspace } from "@/components/tasks/task-workspace";

export const metadata = { title: "Assigned to Me" };

export default function AssignedPage() {
  return (
    <TaskWorkspace
      scope="assigned"
      title="Assigned to Me"
      description="Tasks teammates have assigned to you."
      views={["list", "kanban"]}
      defaultView="list"
      emptyTitle="Nothing assigned to you yet"
      emptyDescription="When a teammate assigns you a task, it'll show up here."
    />
  );
}
