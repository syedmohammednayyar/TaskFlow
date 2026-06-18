"use client";

/**
 * Thin fetch wrapper for client-side mutations. Throws an Error whose
 * `.fieldErrors` carries per-field validation messages (if any).
 */
export async function apiFetch(url, { method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    const error = new Error(json.message || "Something went wrong");
    error.status = res.status;
    error.fieldErrors = json.errors || null;
    throw error;
  }

  return json.data;
}
