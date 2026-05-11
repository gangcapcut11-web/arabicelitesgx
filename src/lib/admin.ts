export const ADMIN_PASSWORD = "3349016";
export const ADMIN_KEY = "admin_unlocked";

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_KEY) === "1";
}
export function unlockAdmin(pw: string): boolean {
  if (pw === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_KEY, "1");
    return true;
  }
  return false;
}
export function lockAdmin() {
  sessionStorage.removeItem(ADMIN_KEY);
}
