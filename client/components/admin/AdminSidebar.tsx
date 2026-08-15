"use client";

import Image from "next/image";
import yaazhLogo from "@/assets/logo yaazh.png";
import type { User } from "@/types";

export type Section = "dashboard" | "users" | "schedules" | "zones" | "complaints" | "votes" | "feedback" | "profile";
export const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "▦" }, { id: "users", label: "Manage users", icon: "◉" }, { id: "schedules", label: "Schedule management", icon: "▤" }, { id: "zones", label: "Zone management", icon: "⌖" }, { id: "complaints", label: "Complaints", icon: "!" }, { id: "votes", label: "Readiness votes", icon: "✓" }, { id: "feedback", label: "Feedback & ratings", icon: "★" }, { id: "profile", label: "My profile", icon: "👤" }
];

interface AdminSidebarProps {
  section: Section;
  user: User;
  profileImage: string;
  collapsed: boolean;
  onToggle: () => void;
  onSelect: (section: Section) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ section, user, profileImage, collapsed, onToggle, onSelect, onLogout }: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar">
      <button className="admin-toggle" onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? "»" : "«"}</button>
      <div className="admin-sidebar-scroll">
        <div className="admin-brand">
          <Image src={yaazhLogo} alt="Yaazh Clean360" priority />
          <span><b>Yaazh Clean360</b><small>Pradesa Sabha portal</small></span>
        </div>
        <div className="admin-identity">
          <div className="admin-avatar">{profileImage || user.profileImage ? <img src={profileImage || user.profileImage} alt="" /> : user.name.slice(0, 1).toUpperCase()}</div>
          <div><strong>{user.name}</strong><small>System administrator</small></div>
        </div>
        <nav aria-label="Administrator navigation">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => onSelect(item.id)}><i aria-hidden="true">{item.icon}</i><span>{item.label}</span></button>
          ))}
        </nav>
        <button className="admin-logout" onClick={onLogout}><i aria-hidden="true">↪</i><span>Log out</span></button>
      </div>
    </aside>
  );
}