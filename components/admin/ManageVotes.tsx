"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminVoteSummary } from "@/types";

const colomboDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
};

export default function ManageVotes() {
  const [summary, setSummary] = useState<AdminVoteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(colomboDate());
  const [error, setError] = useState("");

  const load = async (voteDate: string) => {
    setLoading(true); setError("");
    try { setSummary(await api.adminVoteSummary(voteDate)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load votes"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(date); }, [date]);

  const outcome = summary ? summary.totals.readyPercentage > 50 : false;

  return (
    <section className="admin-votes">
      <article className="admin-panel admin-votes-toolbar">
        <div className="admin-panel-heading">
          <div><p>Daily collection readiness</p><h2>Readiness votes</h2></div>
          <span className="admin-vote-date">{summary?.voteDate || "—"}</span>
        </div>
        <div className="admin-vote-controls">
          <label>Vote date<input type="date" value={date} max={colomboDate()} onChange={(event) => setDate(event.target.value || colomboDate())} /></label>
          <button className="admin-users-clear" type="button" onClick={() => setDate(colomboDate())}>Today</button>
        </div>
        {error && <p className="admin-alert admin-alert--error">{error}</p>}
        {summary && (
          <div className="admin-vote-totals">
            <div><b>{summary.totals.voted}</b><span>votes cast</span></div>
            <div><b>{summary.totals.readyPercentage}%</b><span>ready share</span></div>
            <div><b>{summary.totals.notVoted}</b><span>not voted</span></div>
            <div className={`admin-vote-outcome ${outcome ? "go" : "hold"}`}>{outcome ? "✔ Ready — take out trash" : "✖ Hold — keep trash in"}</div>
          </div>
        )}
      </article>
      {loading ? <p className="admin-empty">Loading readiness votes…</p> : !summary ? <p className="admin-empty">No vote data for this date.</p> : (
        <div className="admin-vote-grid">
          {summary.zones.map((zone, index) => (
            <article className="admin-vote-card" key={zone.zoneId} style={{ animationDelay: `${index * 0.07}s` }}>
              <div className="admin-vote-card-head">
                <span className="admin-vote-badge">Zone {zone.zoneNumber}</span>
                <div><h3>{zone.zoneName}</h3><small>Lorry {zone.assignedLorry}</small></div>
              </div>
              <div className="admin-vote-decision">
                <span className={zone.decision ? "go" : "hold"}>{zone.decision ? "✔ Accepted" : "✖ Declined"}</span>
                <p>{zone.decision ? "Take out the trash today" : "Keep the trash in today"}</p>
              </div>
              <div className="admin-vote-gauge" aria-hidden="true">
                <i className="ready" style={{ width: `${zone.readyPercentage}%` }} />
                <i className="not-ready" style={{ width: `${zone.notReadyPercentage}%` }} />
              </div>
              <div className="admin-vote-metrics">
                <div><b>{zone.ready}</b><span>ready</span><i>{zone.readyPercentage}% of residents</i></div>
                <div><b>{zone.notReady}</b><span>not ready</span><i>{zone.notReadyPercentage}% of residents</i></div>
              </div>
              <div className="admin-vote-participation">
                <span><b>{zone.voted}</b> voted</span>
                <span className="admin-vote-bar"><i style={{ width: `${zone.votedPercentage}%` }} /></span>
                <span><b>{zone.notVoted}</b> not voted</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}