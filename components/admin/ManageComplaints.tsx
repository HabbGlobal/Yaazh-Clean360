"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { AdminComplaint } from "@/types";

const PAGE_SIZE = 5;
const labelize = (value: string) => value.replaceAll("-", " ");
const dateText = (value?: string) => value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

type StatusKey = "submitted" | "in-review" | "resolved";
const SECTIONS: { key: StatusKey; title: string; hint: string }[] = [
  { key: "submitted", title: "Pending", hint: "Waiting for review" },
  { key: "in-review", title: "Reviewed", hint: "Being looked into" },
  { key: "resolved", title: "Resolved", hint: "Closed after action" },
];
const RESET_PAGES: Record<StatusKey, number> = { submitted: 1, "in-review": 1, resolved: 1 };

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<Record<StatusKey, number>>(RESET_PAGES);
  const [saving, setSaving] = useState("");
  const [selected, setSelected] = useState<AdminComplaint | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = async () => {
    const list = await api.adminComplaints();
    setComplaints(list);
    return list;
  };
  const load = async () => {
    setLoading(true); setError("");
    try { setComplaints(await api.adminComplaints()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load complaints"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return complaints;
    return complaints.filter((complaint) => complaint.description.toLowerCase().includes(term) || (complaint.userId?.name || "").toLowerCase().includes(term) || (complaint.userId?.email || "").toLowerCase().includes(term) || (complaint.zoneId?.name || "").toLowerCase().includes(term) || complaint.complaintType.replaceAll("-", " ").toLowerCase().includes(term) || complaint.status.toLowerCase().includes(term));
  }, [complaints, query]);

  const groups = useMemo(() => ({
    submitted: filtered.filter((complaint) => complaint.status === "submitted"),
    "in-review": filtered.filter((complaint) => complaint.status === "in-review"),
    resolved: filtered.filter((complaint) => complaint.status === "resolved"),
  }), [filtered]);

  const pageFor = (status: StatusKey, list: AdminComplaint[]) => {
    const totalPages = Math.max(Math.ceil(list.length / PAGE_SIZE), 1);
    const current = Math.min(pages[status], totalPages);
    return { totalPages, current, paged: list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE), from: list.length ? (current - 1) * PAGE_SIZE + 1 : 0, to: Math.min(current * PAGE_SIZE, list.length) };
  };

  async function saveComplaint(event: React.FormEvent<HTMLFormElement>, complaint: AdminComplaint) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    setSaving(complaint._id); setError(""); setNotice("");
    try {
      const result = await api.updateAdminComplaint(complaint._id, { status: String(form.get("status")) as AdminComplaint["status"], resolutionNote: String(form.get("resolutionNote")) });
      const list = await refresh();
      setSelected(list.find((entry) => entry._id === complaint._id) ?? null);
      setNotice(result.notification === "sent" ? "Complaint updated and resident email sent." : `Complaint updated. Email notification: ${result.notification}.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update complaint"); }
    finally { setSaving(""); }
  }

  async function deleteComplaint(complaint: AdminComplaint) {
    if (!window.confirm(`Delete ${complaint.userId?.name || "this resident"}'s complaint permanently?`)) return;
    setSaving(complaint._id); setError(""); setNotice("");
    try {
      await api.deleteAdminComplaint(complaint._id);
      await refresh();
      setSelected(null);
      setNotice("Complaint deleted.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete complaint"); }
    finally { setSaving(""); }
  }

  const openCard = (complaint: AdminComplaint) => { setError(""); setNotice(""); setSelected(complaint); };
  const resetSearch = () => { setQuery(""); setPages(RESET_PAGES); };

  return (
    <section className="admin-complaints">
      <article className="admin-panel admin-complaints-toolbar">
        <div className="admin-panel-heading">
          <div><p>Community service desk</p><h2>Complaint centre</h2></div>
          <span>{filtered.length} {filtered.length === 1 ? "complaint" : "complaints"}</span>
        </div>
        <form className="admin-users-search" onSubmit={(event) => event.preventDefault()} role="search">
          <label className="admin-search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPages(RESET_PAGES); }} placeholder="Search by resident, zone, type or description" /></label>
          <button className="admin-primary" type="submit">Search</button>
          {query && <button className="admin-users-clear" type="button" onClick={resetSearch}>Clear</button>}
        </form>
        {error && <p className="admin-alert admin-alert--error">{error}</p>}{notice && <p className="admin-alert">{notice}</p>}
      </article>
      {loading ? <p className="admin-empty">Loading complaints…</p> : !filtered.length ? <p className="admin-empty">No complaints match your search.</p> : (
        <div className="admin-complaint-boards">
          {SECTIONS.map((section) => {
            const list = groups[section.key];
            const { totalPages, current, paged, from, to } = pageFor(section.key, list);
            return (
              <section className={`admin-complaint-board ${section.key}`} key={section.key}>
                <header className="admin-complaint-board-head">
                  <div><p>{section.hint}</p><h2>{section.title}</h2></div>
                  <span className="admin-complaint-count">{list.length}</span>
                </header>
                {!list.length ? <p className="admin-empty">No {section.title.toLowerCase()} complaints.</p> : (
                  <>
                    {paged.map((complaint, index) => (
                      <button type="button" key={complaint._id} className={`admin-complaint-card${complaint.status === "resolved" ? " is-resolved" : ""}`} style={{ animationDelay: `${index * 0.06}s` }} onClick={() => openCard(complaint)}>
                        <span className="admin-complaint-card-top"><strong>{complaint.userId?.name || "Resident"}</strong><span className={`admin-status ${complaint.status}`}>{labelize(complaint.status)}</span></span>
                        <small className="admin-complaint-type">{labelize(complaint.complaintType)} · {complaint.zoneId?.name || "Zone"}</small>
                        <p className="admin-complaint-clip">{complaint.description}</p>
                        <span className="admin-complaint-card-footer"><i>Raised {complaint.userStats?.total ?? 0} · {complaint.userStats?.resolved ?? 0} resolved</i><time>{dateText(complaint.createdAt)}</time></span>
                      </button>
                    ))}
                    <div className="admin-users-pagination admin-complaint-pagination">
                      <p>Showing <b>{from}–{to}</b> of <b>{list.length}</b></p>
                      <div>
                        <button disabled={current <= 1} onClick={() => setPages((state) => ({ ...state, [section.key]: current - 1 }))}>← Prev</button>
                        <span>Page <b>{current}</b> of {totalPages}</span>
                        <button disabled={current >= totalPages} onClick={() => setPages((state) => ({ ...state, [section.key]: current + 1 }))}>Next →</button>
                      </div>
                    </div>
                  </>
                )}
              </section>
            );
          })}
        </div>
      )}
      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <article className="admin-modal admin-complaint-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Complaint details">
            <button type="button" className="admin-modal-close" onClick={() => setSelected(null)} aria-label="Close complaint details">✕</button>
            <header className="admin-modal-head">
              <div><p>{labelize(selected.complaintType)}</p><h2>{selected.userId?.name || "Resident"}</h2><small>{selected.zoneId?.name || "Zone"} · {selected.userId?.email}</small></div>
              <span className={`admin-status ${selected.status}`}>{labelize(selected.status)}</span>
            </header>
            <p className="admin-complaint-stats">{selected.userId?.name || "This resident"} has raised <b>{selected.userStats?.total ?? 0}</b> complaint{(selected.userStats?.total ?? 0) === 1 ? "" : "s"} · <b>{selected.userStats?.resolved ?? 0}</b> resolved so far</p>
            <p className="admin-description">{selected.description}</p>
            {selected.photoEvidence && <img className="admin-evidence" src={selected.photoEvidence} alt="Complaint evidence" />}
            <p className="admin-meta">Reported {dateText(selected.createdAt)} · {selected.userId?.phone || "no phone on file"}</p>
            {selected.status === "resolved" ? (
              <>
                <div className="admin-resolution"><p>Resolution note</p><p>{selected.resolutionNote || "No resolution note was left for this complaint."}</p></div>
                <footer className="admin-modal-actions">
                  <button className="danger" disabled={saving === selected._id} onClick={() => void deleteComplaint(selected)}>Delete complaint</button>
                  <button type="button" className="admin-zone-restore" onClick={() => setSelected(null)}>Close</button>
                </footer>
              </>
            ) : (
              <form onSubmit={(event) => void saveComplaint(event, selected)}>
                <label>Status<select name="status" defaultValue={selected.status}><option value="submitted">Pending</option><option value="in-review">In review</option><option value="resolved">Resolved</option></select></label>
                <label>Reply to resident<textarea name="resolutionNote" defaultValue={selected.resolutionNote || ""} placeholder="This message appears in the resident inbox and is emailed." /></label>
                <footer className="admin-modal-actions">
                  <button className="admin-primary" disabled={saving === selected._id}>{saving === selected._id ? "Saving…" : "Save and notify resident"}</button>
                  <button type="button" className="admin-zone-delete" disabled={saving === selected._id} onClick={() => void deleteComplaint(selected)}>Delete complaint</button>
                </footer>
              </form>
            )}
          </article>
        </div>
      )}
    </section>
  );
}