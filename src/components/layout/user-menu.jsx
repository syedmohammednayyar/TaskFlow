"use client";

import { signOut } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";

export function UserMenu({ user }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
        >
          <UserAvatar user={user} className="h-9 w-9" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel className="flex items-center gap-3 py-2 normal-case">
          <UserAvatar user={user} className="h-9 w-9" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">
              {user?.name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserIcon className="h-4 w-4" /> Profile (coming soon)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
