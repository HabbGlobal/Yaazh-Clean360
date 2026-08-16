import { getToken } from "./auth-storage";
import type { AdminComplaint, AdminFeedback, AdminFeedbackSummary, AdminOverview, AdminVote, AdminVoteSummary, Complaint, ComplaintType, Feedback, FeedbackSummary, ReadinessResponse, ReadinessSummary, Schedule, User, Zone } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const REQUEST_TIMEOUT_MS = 30000;
export const zoneMapUrl = (zoneId: string) => `${API_URL}/zones/${zoneId}/map`;
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const token = getToken();
    const response = await fetch(`${API_URL}${path}`, { ...options, signal: controller.signal, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || "Request failed");
    return body.data as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("The server took too long to respond. Please try again.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
export const api = {
  register: (payload: { name: string; email: string; phone: string; address: string; password: string; zoneId: string; profileImage?: string }) => request<{ email: string; message: string }>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  verifyEmail: (payload: { email: string; code: string }) => request<{ token: string; user: User }>("/auth/verify-email", { method: "POST", body: JSON.stringify(payload) }),
  resendOtp: (email: string) => request<{ message: string }>("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }),
  login: (payload: { email: string; password: string }) => request<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  forgotPassword: (email: string) => request<{ email: string; message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (payload: { email: string; code: string; password: string }) => request<{ token: string; user: User }>("/auth/reset-password", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request<User>("/auth/me"),
  zones: () => request<Zone[]>("/zones"),
  selectZone: (zoneId: string) => request<User>("/users/me/zone", { method: "PATCH", body: JSON.stringify({ zoneId }) }),
  updateProfile: (payload: { name?: string; phone?: string; address?: string; profileImage?: string }) => request<User>("/users/me/profile", { method: "PATCH", body: JSON.stringify(payload) }),
  deleteMe: () => request<void>("/users/me", { method: "DELETE" }),
  schedules: (zoneId: string) => request<Schedule[]>(`/schedules/zone/${zoneId}`),
  readiness: () => request<ReadinessSummary>("/resident/readiness"),
  readinessHistory: () => request<ReadinessSummary[]>("/resident/readiness/history"),
  voteReadiness: (response: ReadinessResponse) => request<unknown>("/resident/readiness", { method: "POST", body: JSON.stringify({ response }) }),
  complaints: () => request<Complaint[]>("/resident/complaints"),
  createComplaint: (payload: { complaintType: ComplaintType; description: string; photoEvidence?: string }) => request<Complaint>("/resident/complaints", { method: "POST", body: JSON.stringify(payload) }),
  deleteComplaint: (id: string) => request<void>(`/resident/complaints/${id}`, { method: "DELETE" }),
  feedback: () => request<FeedbackSummary>("/resident/feedback"),
  createFeedback: (payload: { rating: number; comment?: string }) => request<Feedback>("/resident/feedback", { method: "POST", body: JSON.stringify(payload) }),
  createSchedule: (data: Omit<Schedule, "_id">) => request<Schedule>("/schedules", { method: "POST", body: JSON.stringify(data) }),
  updateSchedule: (id: string, data: Partial<Schedule>) => request<Schedule>(`/schedules/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSchedule: (id: string) => request<void>(`/schedules/${id}`, { method: "DELETE" }),
  updateZone: (id: string, data: Partial<Zone>) => request<Zone>(`/zones/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  createZone: (data: Omit<Zone, "_id" | "zoneNumber">) => request<Zone>("/zones", { method: "POST", body: JSON.stringify(data) }),
  deleteZone: (id: string) => request<Zone>(`/zones/${id}`, { method: "DELETE" }),
  adminOverview: () => request<AdminOverview>("/admin/overview"),
  adminZones: () => request<Zone[]>("/admin/zones"),
  adminSchedules: () => request<Schedule[]>("/admin/schedules"),
  adminResidents: () => request<User[]>("/admin/residents"),
  updateResidentStatus: (id: string, accountStatus: "active" | "suspended") => request<User>(`/admin/residents/${id}/status`, { method: "PATCH", body: JSON.stringify({ accountStatus }) }),
  deleteResident: (id: string) => request<void>(`/admin/residents/${id}`, { method: "DELETE" }),
  adminComplaints: () => request<AdminComplaint[]>("/admin/complaints"),
  updateAdminComplaint: (id: string, data: { status: "submitted" | "in-review" | "resolved"; resolutionNote?: string }) => request<{ complaint: AdminComplaint; notification: string }>(`/admin/complaints/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAdminComplaint: (id: string) => request<void>(`/admin/complaints/${id}`, { method: "DELETE" }),
  adminVotes: () => request<AdminVote[]>("/admin/votes"),
  adminVoteSummary: (date?: string) => request<AdminVoteSummary>(`/admin/votes/summary${date ? `?date=${date}` : ""}`),
  adminFeedback: () => request<AdminFeedback[]>("/admin/feedback"),
  adminFeedbackSummary: () => request<AdminFeedbackSummary>("/admin/feedback/summary"),
  updateAdminProfile: (data: { name?: string; email?: string; phone?: string; address?: string; profileImage?: string; password?: string }) => request<User>("/admin/profile", { method: "PATCH", body: JSON.stringify(data) })
};
