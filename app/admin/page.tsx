"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearToken } from "@/lib/auth-storage";
import { useGuard } from "@/lib/use-guard";
import AdminSidebar, { NAV_ITEMS, type Section } from "@/components/admin/AdminSidebar";
import ManageUsers from "@/components/admin/ManageUsers";
import ManageZones from "@/components/admin/ManageZones";
import ManageSchedules from "@/components/admin/ManageSchedules";
import ManageComplaints from "@/components/admin/ManageComplaints";
import ManageVotes from "@/components/admin/ManageVotes";
import ManageFeedback from "@/components/admin/ManageFeedback";
import GlitterWarp from "@/components/admin/GlitterWarp";
import { BarChart, DonutChart, TrendChart } from "@/components/admin/Charts";
import type { AdminOverview } from "@/types";
import yaazhLogo from "@/assets/logo yaazh.png";
import StrokeText from "@/components/common/StrokeText";

export default function AdminPage() {
  const router = useRouter(); const { user, loading } = useGuard("admin");
  const [section, setSection] = useState<Section>("dashboard"); const [overview, setOverview] = useState<AdminOverview | null>(null); const [notice, setNotice] = useState(""); const [error, setError] = useState(""); const [profileImage, setProfileImage] = useState(""); const [collapsed, setCollapsed] = useState(false);
  const loadDashboard = async () => { setOverview(await api.adminOverview()); };
  const loadSection = async (next: Section) => { setError(""); setNotice(""); setSection(next); try { if (next === "dashboard") await loadDashboard(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load this section"); } };
  useEffect(() => { if (user) void loadDashboard().catch((cause) => setError(cause.message)); }, [user]);
  const logout = () => { clearToken(); router.replace("/"); };
  function readProfileImage(file?: File) { if (!file) return; if (!file.type.startsWith("image/") || file.size > 2_000_000) { setError("Choose an image under 2 MB."); return; } const reader = new FileReader(); reader.onload = () => setProfileImage(String(reader.result)); reader.readAsDataURL(file); }
  async function saveProfile(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { await api.updateAdminProfile({ name: String(form.get("name")), email: String(form.get("email")), phone: String(form.get("phone")), address: String(form.get("address")), profileImage: profileImage || undefined, password: String(form.get("password")) || undefined }); setNotice("Administrator profile saved. Sign in again if your email or password changed."); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update profile"); } }
  if (loading || !user) return <main className="admin-loading">Loading secure administrator workspace…</main>;
  return <main className={`admin-shell${collapsed ? " collapsed" : ""}`}><GlitterWarp /><AdminSidebar section={section} user={user} profileImage={profileImage} collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} onSelect={(next) => void loadSection(next)} onLogout={logout} /><section className="admin-content"><header className="admin-topline"><div><p>Yaazh Clean360 / operations centre</p><h1>{NAV_ITEMS.find((item) => item.id === section)?.label}</h1></div><div className="admin-date">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</div></header>{error && <p className="admin-alert admin-alert--error">{error}</p>}{notice && <p className="admin-alert">{notice}</p>}
      {section === "dashboard" && <Dashboard overview={overview} onOpen={loadSection} />}
      {section === "users" && <ManageUsers />}
      {section === "schedules" && <ManageSchedules />}
      {section === "zones" && <ManageZones />}
      {section === "complaints" && <ManageComplaints />}
      {section === "votes" && <ManageVotes />}
      {section === "feedback" && <ManageFeedback />}
      {section === "profile" && <form className="admin-panel admin-profile-form" onSubmit={(event) => void saveProfile(event)}><div className="admin-panel-heading"><div><p>Secure administrator account</p><h2>My profile</h2></div><div className="admin-avatar large">{profileImage || user.profileImage ? <img src={profileImage || user.profileImage} alt="" /> : user.name.slice(0, 1).toUpperCase()}</div></div><label>Profile picture <small>PNG, JPG, WEBP or GIF; max 2 MB.</small><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => readProfileImage(event.target.files?.[0])} /></label><label>Display name<input name="name" defaultValue={user.name} required /></label><label>Email address<input name="email" type="email" defaultValue={user.email} required /></label><label>Phone number<input name="phone" defaultValue={user.phone || ""} required /></label><label>Office address<textarea name="address" defaultValue={user.address || ""} required /></label><label>New password <small>Leave blank to keep current password.</small><input name="password" type="password" minLength={8} placeholder="Minimum 8 characters" /></label><button className="admin-primary">Save administrator profile</button></form>}
    </section></main>;
}
function Dashboard({ overview, onOpen }: { overview: AdminOverview | null; onOpen: (section: Section) => Promise<void> }) { const cards = [{ label: "Active residents", value: overview?.activeResidents ?? "—", action: "users", color: "mint" }, { label: "Open complaints", value: overview?.complaints.total ?? "—", action: "complaints", color: "pink" }, { label: "Readiness votes", value: overview?.votes ?? "—", action: "votes", color: "purple" }, { label: "Average service rating", value: overview ? `${overview.feedback.averageRating}/5` : "—", action: "feedback", color: "yellow" }];
  const complaintStatus = overview ? [{ label: "Submitted", value: overview.complaints.submitted, title: "Waiting for review" }, { label: "In review", value: overview.complaints.inReview, title: "Being looked into" }, { label: "Resolved", value: overview.complaints.resolved, title: "Closed after action" }] : [];
  const residentsByZone = overview?.residentsByZone.map((item) => ({ label: item.zone, value: item.count })) ?? [];
  const feedbackRatings = overview?.feedbackRatings.map((item) => ({ label: `${item.rating} star${item.rating > 1 ? "s" : ""}`, value: item.count })) ?? [];
  const complaintTypes = overview?.complaintTypes.map((item) => ({ label: item.type.replaceAll("-", " "), value: item.count })) ?? [];
  const trend = trendData(overview);
  return <><section className="admin-hero"><div className="admin-hero-copy"><p className="admin-sticker">Municipal operations command</p><StrokeText text="Keep every collection visible, responsive, and accountable." strokeColor="#8655EF" fillColor="#1d293d" highlight={["visible", "accountable"]} highlightColor="#8655EF" strokeWidth={1.6} drawDuration={1.4} fillDelay={0.35} stagger={0.045} ease="power2.out" trigger="mount" fillMode="wipe" fontSize={108} fontWeight={800} letterSpacing={-4} style={{ fontFamily: "'Playfair Display', Georgia, serif" }} /><p>Monitor resident activity, resolve reported issues, publish schedules, and maintain the five Yaazh Clean360 zones from one protected workspace.</p></div><div className="admin-hero-logo" aria-hidden="true"><Image src={yaazhLogo} alt="" priority /></div></section><section className="admin-stat-grid">{cards.map((card) => <button className={`admin-stat ${card.color}`} key={card.label} onClick={() => void onOpen(card.action as Section)}><strong>{card.value}</strong><span>{card.label}</span><small>Open →</small></button>)}</section>
    <section className="admin-chart-grid">
      <article className="admin-panel"><div className="admin-panel-heading"><div><p>Service centre</p><h2>Complaint status</h2></div><span>{overview?.complaints.total ?? "—"} total</span></div><DonutChart data={complaintStatus} centerTitle="complaints" centerValue={String(overview?.complaints.total ?? "—")} /></article>
      <article className="admin-panel"><div className="admin-panel-heading"><div><p>Community map</p><h2>Residents by zone</h2></div><span>{overview?.residents ?? "—"} registered</span></div><DonutChart data={residentsByZone} centerTitle="residents" centerValue={String(overview?.residents ?? "—")} /></article>
      <article className="admin-panel"><div className="admin-panel-heading"><div><p>Voice of residents</p><h2>Feedback ratings</h2></div><span>{overview ? `${overview.feedback.averageRating}/5 average` : "—"}</span></div>{overview ? <BarChart data={feedbackRatings} /> : <Empty text="Waiting for service data…" />}</article>
      <article className="admin-panel"><div className="admin-panel-heading"><div><p>Reported issues</p><h2>Complaints by type</h2></div><span>{overview?.complaints.total ?? "—"} total</span></div>{overview ? <BarChart data={complaintTypes} /> : <Empty text="Waiting for service data…" />}</article>
      <article className="admin-panel admin-panel--wide"><div className="admin-panel-heading"><div><p>Last 7 days</p><h2>Complaints reported</h2></div><span>{overview ? trend.reduce((sum, item) => sum + item.value, 0) : "—"} this week</span></div><TrendChart data={trend} /></article>
    </section>
    <section className="admin-panel admin-summary"><div><p>Collection configuration</p><h2>{overview?.zones ?? "—"} active zones · {overview?.schedules ?? "—"} published schedule entries</h2></div><button className="admin-primary" onClick={() => void onOpen("schedules")}>Manage schedules</button></section></> }
function trendData(overview: AdminOverview | null) { const days: { label: string; value: number; title: string }[] = []; for (let index = 6; index >= 0; index--) { const date = new Date(); date.setDate(date.getDate() - index); const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; const match = overview?.complaintsTrend.find((item) => item.date === key); days.push({ label: date.toLocaleDateString("en-GB", { weekday: "short" }), title: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), value: match?.count ?? 0 }); } return days; }
function Empty({ text }: { text: string }) { return <p className="admin-empty">{text}</p>; }
