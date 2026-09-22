export type Role = "student" | "teacher";

const STUDENT_ID_KEY = "lp_student_id";
const STUDENT_NAME_KEY = "lp_student_name";
const ROLE_KEY = "lp_role";

export function saveStudentSession(id: string, name: string) {
  localStorage.setItem(STUDENT_ID_KEY, id);
  localStorage.setItem(STUDENT_NAME_KEY, name);
  localStorage.setItem(ROLE_KEY, "student");
}

export function saveTeacherSession() {
  localStorage.setItem(ROLE_KEY, "teacher");
}

export function getStudentId(): string | null {
  return localStorage.getItem(STUDENT_ID_KEY);
}

export function getStudentName(): string | null {
  return localStorage.getItem(STUDENT_NAME_KEY);
}

export function getRole(): Role | null {
  return localStorage.getItem(ROLE_KEY) as Role | null;
}

export function clearSession() {
  localStorage.removeItem(STUDENT_ID_KEY);
  localStorage.removeItem(STUDENT_NAME_KEY);
  localStorage.removeItem(ROLE_KEY);
}
