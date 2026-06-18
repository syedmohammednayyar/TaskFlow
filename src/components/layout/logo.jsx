import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ href = "/", className, showText = true }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <CheckCheck className="h-5 w-5" />
      </span>
      {showText && (
        <span className="text-lg font-bold tracking-tight">TaskFlow</span>
      )}
    </Link>
  );
}
