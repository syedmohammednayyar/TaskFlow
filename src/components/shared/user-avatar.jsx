"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, generateAvatar, cn } from "@/lib/utils";

/**
 * Renders a user's avatar with a graceful initials fallback.
 */
export function UserAvatar({ user, className }) {
  const name = user?.name || "User";
  const src = user?.avatar || user?.image || generateAvatar(name);
  return (
    <Avatar className={cn("border", className)}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback>{getInitials(name) || "U"}</AvatarFallback>
    </Avatar>
  );
}
