"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        // Priority tones
        high: "border-transparent bg-red-500/12 text-red-600 dark:text-red-400",
        medium: "border-transparent bg-orange-500/12 text-orange-600 dark:text-orange-400",
        low: "border-transparent bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
        // Status tones
        todo: "border-transparent bg-slate-500/12 text-slate-600 dark:text-slate-300",
        progress: "border-transparent bg-blue-500/12 text-blue-600 dark:text-blue-400",
        completed: "border-transparent bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
