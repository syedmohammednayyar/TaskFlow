import {
  LayoutDashboard,
  ListTodo,
  KanbanSquare,
  UserCheck,
  Inbox,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "All Tasks", icon: ListTodo },
  { href: "/kanban", label: "Kanban Board", icon: KanbanSquare },
  { href: "/my-tasks", label: "My Tasks", icon: Inbox },
  { href: "/assigned", label: "Assigned to Me", icon: UserCheck },
];
