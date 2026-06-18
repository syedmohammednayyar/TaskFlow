import { TaskWorkspace } from "@/components/tasks/task-workspace";

export const metadata = { title: "All Tasks" };

export default async function TasksPage({ searchParams }) {
  const params = await searchParams;
  const initialQuery = typeof params?.q === "string" ? params.q : "";

  return (
    <TaskWorkspace
      scope="all"
      title="All Tasks"
      description="Everything you've created or that's been assigned to you."
      views={["list", "kanban"]}
      defaultView="list"
      initialQuery={initialQuery}
      emptyTitle="No tasks yet"
      emptyDescription="Create your first task to get the ball rolling."
    />
  );
}
