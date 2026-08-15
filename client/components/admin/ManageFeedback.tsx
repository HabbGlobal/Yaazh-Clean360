"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { AdminFeedback, AdminFeedbackSummary } from "@/types";

const dateText = (value?: string) => value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function Stars({ rating, animated }: { rating: number; animated?: boolean }) {
  return <span className={`admin-stars${animated ? " admin-stars--pop" : ""}`} aria-label={`${rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => <i key={star} className={star <= rating ? "on" : ""} style={animated ? { animationDelay: `${(star - 1) * 0.05}s` } : undefined}>★</i>)}</span>;
}

export default function ManageFeedback() {
  const [summary, setSummary] = useState<AdminFeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState(0);
  const [zone, setZone] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const load = async () => { setLoading(true); setError(""); try { setSummary(await api.adminFeedbackSummary()); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load feedback"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    if (!summary) return [];
    const term = search.trim().toLowerCase();
    return summary.items.filter((item) => {
      if (rating && item.rating !== rating) return false;
      if (zone && item.zoneId?._id !== zone) return false;
      if (!term) return true;
      return [item.userId?.name, item.zoneId?.name, item.comment].join(" ").toLowerCase().includes(term);
    });
  }, [summary, search, rating, zone]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * perPage, current * perPage);
  const maxCount = summary ? Math.max(1, ...summary.ratings.map((item) => item.count)) : 1;

  return (
    <section className="admin-feedback">
      <article className="admin-panel admin-feedback-toolbar">
        <div className="admin-panel-heading"><div><p>Service quality</p><h2>Feedback & ratings</h2></div><span>{summary ? `${summary.total} responses` : "—"}</span></div>
        {error && <p className="admin-alert admin-alert--error">{error}</p>}
        {summary && (
          <>
            <div className="admin-feedback-overview">
              <div className="admin-feedback-score">
                <strong>{summary.averageRating.toFixed(1)}</strong><span>/ 5</span>
                <Stars rating={Math.round(summary.averageRating)} animated />
                <small>average across {summary.total} rating{summary.total === 1 ? "" : "s"}</small>
              </div>
              <ul className="admin-feedback-bars">
                {summary.ratings.slice().reverse().map((item) => (
                  <li key={item.rating}><span><i>★</i>{item.rating}</span><span className="admin-feedback-track"><i style={{ width: `${(item.count / maxCount) * 100}%` }} /></span><b>{item.count}</b></li>
                ))}
              </ul>
            </div>
            <div className="admin-feedback-zones">
              {summary.zones.map((item, index) => (
                <button type="button" key={item.zoneId} className={`admin-feedback-zone${zone === item.zoneId ? " active" : ""}`} onClick={() => { setZone(zone === item.zoneId ? "" : item.zoneId); setPage(1); }} style={{ animationDelay: `${index * 0.06}s` }}>
                  <span className="admin-feedback-zone-name">{item.zoneName}</span>
                  <Stars rating={Math.round(item.averageRating)} />
                  <small><b>{item.averageRating.toFixed(1)}</b> · {item.count} rating{item.count === 1 ? "" : "s"}</small>
                </button>
              ))}
              {!summary.zones.length && <p className="admin-empty">No zone ratings yet.</p>}
            </div>
          </>
        )}
      </article>
      <article className="admin-panel">
        <div className="admin-users-search">
          <div className="admin-search-box"><span>⌕</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search residents, zones, comments…" /></div>
          <select value={rating} onChange={(event) => { setRating(Number(event.target.value)); setPage(1); }}><option value={0}>All ratings</option>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} star{value > 1 ? "s" : ""}</option>)}</select>
          <select value={zone} onChange={(event) => { setZone(event.target.value); setPage(1); }}><option value="">All zones</option>{summary?.zones.map((item) => <option key={item.zoneId} value={item.zoneId}>{item.zoneName}</option>)}</select>
          {(search || rating || zone) && <button className="admin-users-clear" type="button" onClick={() => { setSearch(""); setRating(0); setZone(""); setPage(1); }}>Clear</button>}
        </div>
        {loading ? <p className="admin-empty">Loading feedback…</p> : !visible.length ? <p className="admin-empty">No matching feedback yet.</p> : (
          <div className="admin-feedback-items">
            {visible.map((item, index) => <FeedbackCard key={item._id} item={item} index={index} />)}
          </div>
        )}
        <div className="admin-users-pagination"><p>Showing <b>{visible.length}</b> of <b>{filtered.length}</b> matching response{filtered.length === 1 ? "" : "s"}</p><div><button className="admin-users-clear" type="button" disabled={current === 1} onClick={() => setPage(current - 1)}>‹ Prev</button><p><b>{current}</b> / {pages}</p><button className="admin-users-clear" type="button" disabled={current === pages} onClick={() => setPage(current + 1)}>Next ›</button></div></div>
      </article>
    </section>
  );
}

function FeedbackCard({ item, index }: { item: AdminFeedback; index: number }) {
  return (
    <article className="admin-feedback-item" style={{ animationDelay: `${index * 0.06}s` }}>
      <div className="admin-feedback-item-top">
        <Stars rating={item.rating} animated />
        <span className="admin-feedback-item-zone">{item.zoneId?.name}</span>
      </div>
      <p>{item.comment || "No written comment."}</p>
      <footer><span className="admin-feedback-item-avatar">{item.userId?.name.slice(0, 1).toUpperCase()}</span><strong>{item.userId?.name}</strong><small>{dateText(item.serviceDate)}</small></footer>
    </article>
  );
}