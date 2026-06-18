"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PRIORITIES, STATUSES } from "@/lib/validations";

export function TaskFilters({ filters, onChange, onClear }) {
  const hasActive =
    (filters.q && filters.q.length > 0) ||
    filters.status !== "All" ||
    filters.priority !== "All";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by title or description…"
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select value={filters.status} onValueChange={(v) => onChange({ status: v })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.priority} onValueChange={(v) => onChange({ priority: v })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActive && (
          <Button variant="ghost" size="icon" onClick={onClear} aria-label="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
