"use client";

import useSWR from "swr";

export function useActivity(taskId) {
  const { data, error, isLoading } = useSWR(
    taskId ? `/api/tasks/${taskId}/activity` : null
  );

  return {
    activities: data?.items || [],
    isLoading,
    isError: !!error,
  };
}
