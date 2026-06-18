"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Pencil, Trash2, CheckCircle2, Circle, Timer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const STATUS_ICON = {
  Todo: Circle,
  "In Progress": Timer,
  Completed: CheckCircle2,
};

export function TaskRowActions({ task, currentUserId, onEdit, onDelete, onStatusChange }) {
  const router = useRouter();
  const isCreator = task.createdBy?.id === currentUserId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Task actions"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}`)}>
          <Eye className="h-4 w-4" /> View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit?.(task)} disabled={!isCreator}>
          <Pencil className="h-4 w-4" /> Edit
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Move to</DropdownMenuLabel>
        {["Todo", "In Progress", "Completed"].map((status) => {
          const Icon = STATUS_ICON[status];
          return (
            <DropdownMenuItem
              key={status}
              disabled={task.status === status}
              onClick={() => onStatusChange?.(task, status)}
            >
              <Icon className="h-4 w-4" /> {status}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete?.(task)}
          disabled={!isCreator}
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
