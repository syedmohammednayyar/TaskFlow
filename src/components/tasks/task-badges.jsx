import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PRIORITY_VARIANT = { High: "high", Medium: "medium", Low: "low" };
const STATUS_VARIANT = {
  Todo: "todo",
  "In Progress": "progress",
  Completed: "completed",
};
const PRIORITY_DOT = {
  High: "bg-red-500",
  Medium: "bg-orange-500",
  Low: "bg-emerald-500",
};

export function PriorityBadge({ priority, className }) {
  return (
    <Badge variant={PRIORITY_VARIANT[priority] || "default"} className={className}>
      <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[priority])} />
      {priority}
    </Badge>
  );
}

export function StatusBadge({ status, className }) {
  return (
    <Badge variant={STATUS_VARIANT[status] || "default"} className={className}>
      {status}
    </Badge>
  );
}
