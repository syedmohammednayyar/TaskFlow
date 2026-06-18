"use client";

import useSWR from "swr";

/**
 * Poll notifications every 30s so badges stay reasonably fresh.
 */
export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR("/api/notifications", {
    refreshInterval: 30000,
  });

  return {
    notifications: data?.items || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    isError: !!error,
    mutate,
  };
}
