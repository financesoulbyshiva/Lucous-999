// Shared helpers for talking to the LUCOUS Express backend from student pages.

import type { Question } from "@/types/api";

declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem("lucous_token") ??
    window.sessionStorage.getItem("lucous_token")
  );
}

export function getStoredUser(): { id?: string; name?: string; email?: string } | null {
  if (typeof window === "undefined") return null;
  const raw =
    window.localStorage.getItem("lucous_user") ??
    window.sessionStorage.getItem("lucous_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id?: string; name?: string; email?: string };
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem("lucous_token");
    storage.removeItem("lucous_user");
  }
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data: unknown = await res.json().catch(() => ({}));
  const payload = (data ?? {}) as { success?: boolean; message?: string };

  if (!res.ok || !payload.success) {
    throw new Error(payload.message || "Request failed");
  }

  return data as T;
}

export const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD"] as const;

export function optionText(question: Question, index: number): string {
  return question[OPTION_KEYS[index]] ?? "";
}

// Re-export all centralized API data contracts
export * from "@/types/api";
