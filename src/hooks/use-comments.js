"use client";

import useSWR from "swr";

export function useComments(taskId) {
  const { data, error, isLoading, mutate } = useSWR(
    taskId ? `/api/tasks/${taskId}/comments` : null
  );

  return {
    comments: data?.items || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
