"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { User } from "@/types";

const PAGE_SIZE = 5;
const dateText = (value?: string) => value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function ManageUsers() {
  const [residents, setResidents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<User | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setResidents(await api.adminResidents()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load residents"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return residents;
    return residents.filter((resident) => {
      const zone = typeof resident.zoneId === "object" && resident.zoneId ? resident.zoneId.name : "";
      return resident.name.toLowerCase().includes(term) || resident.email.toLowerCase().includes(term) || (resident.phone || "").toLowerCase().includes(term) || zone.toLowerCase().includes(term);
    });
  }, [residents, query]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const from = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(currentPage * PAGE_SIZE, filtered.length);

  async function toggleStatus(user: User) {
    const next = user.accountStatus === "active" ? "suspended" : "active";
    setBusy(user._id); setError(""); setNotice("");
    try {
      await api.updateResidentStatus(user._id, next);
      setResidents((list) => list.map((entry) => entry._id === user._id ? { ...entry, accountStatus: next } : entry));
      setSelected((current) => current && current._id === user._id ? { ...current, accountStatus: next } : current);
      setNotice(`Resident ${next === "active" ? "activated" : "suspended"}.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update resident"); }
    finally { setBusy(""); }
  }

  async function remove(user: User) {
    if (!window.confirm("Delete this resident and their activity records?")) return;
    setBusy(user._id); setError(""); setNotice("");
    try {
      await api.deleteResident(user._id);
      setResidents((list) => list.filter((entry) => entry._id !== user._id));
      setSelected((current) => current && current._id === user._id ? null : current);
      setNotice("Resident account deleted.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete resident"); }
    finally { setBusy(""); }
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setPage(1); }

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div><p>Community registry</p><h2>Resident accounts</h2></div>
        <span>{filtered.length} {filtered.length === 1 ? "record" : "records"}</span>
      </div>
      <form className="admin-users-search" onSubmit={submitSearch} role="search">
        <label className="admin-search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search by name, email, phone or zone" /></label>
        <button className="admin-primary" type="submit">Search</button>
        {query && <button className="admin-users-clear" type="button" onClick={() => { setQuery(""); setPage(1); }}>Clear</button>}
      </form>
      {error && <p className="admin-alert admin-alert--error">{error}</p>}{notice && <p className="admin-alert">{notice}</p>}
      {loading ? <p className="admin-empty">Loading residents…</p> : !paged.length ? <p className="admin-empty">No residents match your search.</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Resident</th><th>Zone</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {paged.map((resident) => (
                <tr key={resident._id}>
                  <td><button className="admin-user-link" onClick={() => setSelected(resident)}><span className="admin-avatar">{resident.profileImage ? <img src={resident.profileImage} alt="" /> : resident.name.slice(0, 1).toUpperCase()}</span><span><strong>{resident.name}</strong><small>{resident.email}</small></span></button></td>
                  <td>{typeof resident.zoneId === "object" && resident.zoneId ? resident.zoneId.name : "No zone"}</td>
                  <td>{resident.phone || "—"}</td>
                  <td><span className={`admin-status ${resident.accountStatus}`}>{resident.accountStatus}</span></td>
                  <td className="admin-actions">
                    <button data-kind="view" onClick={() => setSelected(resident)}>View</button>
                    <button data-kind="toggle" disabled={busy === resident._id} onClick={() => void toggleStatus(resident)}>{resident.accountStatus === "active" ? "Suspend" : "Restore"}</button>
                    <button className="danger" disabled={busy === resident._id} onClick={() => void remove(resident)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="admin-users-pagination">
        <p>Showing <b>{from}–{to}</b> of <b>{filtered.length}</b> records</p>
        <div>
          <button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>← Prev</button>
          <span>Page <b>{currentPage}</b> of {totalPages}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next →</button>
        </div>
      </div>
      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <article className="admin-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${selected.name} details`}>
            <button className="admin-modal-close" onClick={() => setSelected(null)} aria-label="Close details">✕</button>
            <header className="admin-modal-head">
              <span className="admin-avatar large">{selected.profileImage ? <img src={selected.profileImage} alt="" /> : selected.name.slice(0, 1).toUpperCase()}</span>
              <div><p>Resident profile</p><h2>{selected.name}</h2><small>{selected.email}</small></div>
              <span className={`admin-status ${selected.accountStatus}`}>{selected.accountStatus}</span>
            </header>
            <dl className="admin-modal-grid">
              <div><dt>Phone</dt><dd>{selected.phone || "—"}</dd></div>
              <div><dt>Address</dt><dd>{selected.address || "—"}</dd></div>
              <div><dt>Zone</dt><dd>{typeof selected.zoneId === "object" && selected.zoneId ? `${selected.zoneId.name} · ${selected.zoneId.assignedLorry}` : "No zone"}</dd></div>
              <div><dt>Member since</dt><dd>{dateText(selected.createdAt)}</dd></div>
              <div><dt>Email verified</dt><dd>{selected.emailVerified ? "Yes" : "No"}</dd></div>
              <div><dt>Role</dt><dd>Resident</dd></div>
            </dl>
            <footer className="admin-modal-actions">
              <button className="admin-primary" disabled={busy === selected._id} onClick={() => void toggleStatus(selected)}>{selected.accountStatus === "active" ? "Suspend account" : "Restore account"}</button>
              <button className="danger" disabled={busy === selected._id} onClick={() => void remove(selected)}>Delete resident</button>
            </footer>
          </article>
        </div>
      )}
    </section>
  );
}