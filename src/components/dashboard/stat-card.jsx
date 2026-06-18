"use client";

import { m } from "framer-motion";
import { cn } from "@/lib/utils";

const TONES = {
  primary: "bg-primary/10 text-primary",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function StatCard({ label, value, icon: Icon, tone = "primary", hint, index = 0 }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", TONES[tone])}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <m.span
          key={value}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl font-bold tracking-tight"
        >
          {value}
        </m.span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </m.div>
  );
}
