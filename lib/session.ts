"use client";

import { useSyncExternalStore } from "react";

export type Role = "student" | "teacher";

const STUDENT_ID_KEY = "lp_student_id";
const STUDENT_NAME_KEY = "lp_student_name";
const ROLE_KEY = "lp_role";

export function saveStudentSession(id: string, name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STUDENT_ID_KEY, id);
  localStorage.setItem(STUDENT_NAME_KEY, name);
  localStorage.setItem(ROLE_KEY, "student");
}

export function saveTeacherSession() {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLE_KEY, "teacher");
}

export function getStudentId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STUDENT_ID_KEY);
}

export function getStudentName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STUDENT_NAME_KEY);
}

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY) as Role | null;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STUDENT_ID_KEY);
  localStorage.removeItem(STUDENT_NAME_KEY);
  localStorage.removeItem(ROLE_KEY);
}

/**
 * Fetches a student-scoped API. If the saved student no longer exists (e.g. the database
 * was reset), the stale session is cleared and onMissing runs instead of the page crashing.
 */
export async function fetchStudentJson<T>(url: string, onMissing: () => void): Promise<T | null> {
  const res = await fetch(url);
  if (res.status === 404 || res.status === 401) {
    clearSession();
    onMissing();
    return null;
  }
  if (!res.ok) throw new Error(`${url} failed with ${res.status}`);
  return res.json() as Promise<T>;
}

const emptySubscribe =(callback: () => void) => {
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }
  return () => {};
};

export function useStudentId(): string | null {
  return useSyncExternalStore(
    emptySubscribe,
    () => getStudentId(),
    () => null
  );
}
