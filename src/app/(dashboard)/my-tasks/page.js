import { TaskWorkspace } from "@/components/tasks/task-workspace";

export const metadata = { title: "My Tasks" };

export default function MyTasksPage() {
  return (
    <TaskWorkspace
      scope="mine"
      title="My Tasks"
      description="Tasks you've created."
      views={["list", "kanban"]}
      defaultView="list"
      emptyTitle="You haven't created any tasks"
      emptyDescription="Create a task and assign it to a teammate or yourself."
    />
  );
}
