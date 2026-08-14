import { getToken } from "./auth-storage";
import type { Schedule, User, Zone } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Request failed");
  return body.data as T;
}
export const api = {
  register: (payload: { name: string; email: string; password: string; zoneId: string; profileImage?: string }) => request<{ email: string; message: string }>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  verifyEmail: (payload: { email: string; code: string }) => request<{ token: string; user: User }>("/auth/verify-email", { method: "POST", body: JSON.stringify(payload) }),
  resendOtp: (email: string) => request<{ message: string }>("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }),
  login: (payload: { email: string; password: string }) => request<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request<User>("/auth/me"),
  zones: () => request<Zone[]>("/zones"),
  selectZone: (zoneId: string) => request<User>("/users/me/zone", { method: "PATCH", body: JSON.stringify({ zoneId }) }),
  updateProfile: (payload: { name?: string; profileImage?: string }) => request<User>("/users/me/profile", { method: "PATCH", body: JSON.stringify(payload) }),
  schedules: (zoneId: string) => request<Schedule[]>(`/schedules/zone/${zoneId}`),
  createSchedule: (data: Omit<Schedule, "_id">) => request<Schedule>("/schedules", { method: "POST", body: JSON.stringify(data) }),
  updateSchedule: (id: string, data: Partial<Schedule>) => request<Schedule>(`/schedules/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSchedule: (id: string) => request<void>(`/schedules/${id}`, { method: "DELETE" })
};
