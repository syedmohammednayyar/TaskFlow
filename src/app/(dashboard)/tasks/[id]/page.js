import { TaskDetail } from "@/components/tasks/task-detail";

export const metadata = { title: "Task details" };

export default async function TaskDetailPage({ params }) {
  const { id } = await params;
  return <TaskDetail id={id} />;
}
