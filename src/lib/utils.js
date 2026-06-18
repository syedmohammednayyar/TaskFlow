import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";

/**
 * Merge Tailwind class names with conflict resolution.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a deterministic default avatar URL from a name.
 */
export function generateAvatar(name = "User") {
  const seed = encodeURIComponent(name.trim() || "User");
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundType=gradientLinear&fontWeight=600`;
}

/**
 * Build initials from a full name ("Jane Doe" -> "JD").
 */
export function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Human-friendly absolute date ("Jun 18, 2026").
 */
export function formatDate(date) {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy");
}

/**
 * Relative time ("3 hours ago").
 */
export function formatRelative(date) {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Friendly due-date label with overdue awareness.
 */
export function formatDueDate(date) {
  if (!date) return { label: "No due date", tone: "muted" };
  const d = new Date(date);
  if (isToday(d)) return { label: "Due today", tone: "warning" };
  if (isTomorrow(d)) return { label: "Due tomorrow", tone: "default" };
  if (isPast(d)) return { label: `Overdue · ${format(d, "MMM d")}`, tone: "danger" };
  return { label: format(d, "MMM d, yyyy"), tone: "default" };
}

/**
 * Whether a task is overdue (past due date and not completed).
 */
export function isOverdue(task) {
  if (!task?.dueDate || task.status === "Completed") return false;
  return isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
}
