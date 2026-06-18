"use client";

import useSWR from "swr";
import { useMemo } from "react";

/**
 * Fetch tasks with optional scope/status/priority/search filters.
 * Returns SWR state plus a `mutate` to refresh after writes.
 */
export function useTasks({ scope = "all", status, priority, q, page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (scope) params.set("scope", scope);
  if (status && status !== "All") params.set("status", status);
  if (priority && priority !== "All") params.set("priority", priority);
  if (q && q.trim()) params.set("q", q.trim());
  if (page !== 1) params.set("page", String(page));
  if (limit !== 50) params.set("limit", String(limit));

  const key = `/api/tasks?${params.toString()}`;
  const { data, error, isLoading, mutate } = useSWR(key);

  return {
    tasks: data?.items || [],
    total: data?.total ?? 0,
    hasMore: data?.hasMore ?? false,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useTask(id) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/api/tasks/${id}` : null);
  return { task: data, isLoading, isError: !!error, error, mutate };
}

export function useStats() {
  const { data, error, isLoading, mutate } = useSWR("/api/stats");
  return { stats: data, isLoading, isError: !!error, mutate };
}

export function useUsers() {
  const { data, error, isLoading } = useSWR("/api/users");
  return { users: useMemo(() => data || [], [data]), isLoading, isError: !!error };
}
