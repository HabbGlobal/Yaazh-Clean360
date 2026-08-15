"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { WEEKDAYS, WASTE_TYPES } from "@/lib/constants";
import type { Schedule, Weekday, WasteType, Zone } from "@/types";

export default function ManageSchedules() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState<{ zone: Zone; weekday: Weekday } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [zoneList, scheduleList] = await Promise.all([api.adminZones(), api.adminSchedules()]);
      setZones(zoneList.filter((zone) => zone.isActive));
      setSchedules(scheduleList);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load schedules"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const sortedZones = useMemo(() => [...zones].sort((a, b) => a.zoneNumber - b.zoneNumber), [zones]);
  const byZoneDay = useMemo(() => {
    const map = new Map<string, Schedule>();
    for (const schedule of schedules) map.set(`${schedule.zoneId}:${schedule.weekday}`, schedule);
    return map;
  }, [schedules]);

  async function addSchedule(event: React.FormEvent<HTMLFormElement>) {
    if (!adding) return;
    event.preventDefault(); const form = new FormData(event.currentTarget);
    setSaving(true); setError(""); setNotice("");
    try {
      await api.createSchedule({ zoneId: adding.zone._id, weekday: adding.weekday, wasteType: String(form.get("wasteType")) as WasteType, collectionTime: String(form.get("collectionTime")), notes: String(form.get("notes")), isActive: true });
      setSchedules(await api.adminSchedules());
      setAdding(null);
      setNotice(`${adding.zone.name} · ${adding.weekday} collection day saved.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save schedule. Each zone can have one entry per weekday."); }
    finally { setSaving(false); }
  }

  async function removeSchedule(schedule: Schedule) {
    setBusy(schedule._id); setError(""); setNotice("");
    try {
      await api.deleteSchedule(schedule._id);
      setSchedules((list) => list.filter((entry) => entry._id !== schedule._id));
      setNotice("Schedule entry removed.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to remove schedule"); }
    finally { setBusy(""); }
  }

  const openAdd = (zone: Zone, weekday: Weekday) => { setError(""); setNotice(""); setAdding({ zone, weekday }); };

  return (
    <section className="admin-schedule-manage">
      <article className="admin-panel">
        <div className="admin-panel-heading">
          <div><p>Collection network</p><h2>Zone collection plan</h2></div>
          <span>Monday–Saturday · {sortedZones.length} zones</span>
        </div>
        <p className="admin-description admin-schedule-hint">Click <b>+ Add</b> on any day to record a collection day for that zone. Each zone keeps one entry per weekday.</p>
        {error && <p className="admin-alert admin-alert--error">{error}</p>}{notice && <p className="admin-alert">{notice}</p>}
        {loading ? <p className="admin-empty">Loading collection plan…</p> : (
          <div className="admin-table-wrap admin-schedule-matrix">
            <table className="admin-table">
              <thead>
                <tr><th>Zone</th>{WEEKDAYS.map((day) => <th key={day}>{day.slice(0, 3)}</th>)}</tr>
              </thead>
              <tbody>
                {sortedZones.map((zone) => (
                  <tr key={zone._id}>
                    <td><strong>{zone.name}</strong><small>Lorry {zone.assignedLorry}</small></td>
                    {WEEKDAYS.map((day) => {
                      const schedule = byZoneDay.get(`${zone._id}:${day}`);
                      return (
                        <td key={day}>
                          {schedule ? (
                            <div className="admin-schedule-slot">
                              <span className="admin-schedule-waste" data-kind={schedule.wasteType}>{schedule.wasteType}</span>
                              <b>{schedule.collectionTime}</b>
                              {schedule.notes && <small>{schedule.notes}</small>}
                              <button className="admin-schedule-remove" disabled={busy === schedule._id} onClick={() => void removeSchedule(schedule)} title="Remove this collection day" aria-label={`Remove ${day} collection for ${zone.name}`}>✕</button>
                            </div>
                          ) : (
                            <button className="admin-schedule-add" type="button" onClick={() => openAdd(zone, day)}>+ Add</button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {!sortedZones.length && <tr><td colSpan={WEEKDAYS.length + 1}><p className="admin-empty">No active zones available. Add a zone first.</p></td></tr>}
              </tbody>
            </table>
            <div className="admin-schedule-legend">{WASTE_TYPES.map((type) => <span key={type}><i data-kind={type} />{type}</span>)}</div>
          </div>
        )}
      </article>
      {adding && (
        <div className="admin-modal-backdrop" onClick={() => setAdding(null)}>
          <form className="admin-modal admin-schedule-add-form" onClick={(event) => event.stopPropagation()} onSubmit={(event) => void addSchedule(event)}>
            <button type="button" className="admin-modal-close" onClick={() => setAdding(null)} aria-label="Close collection day form">✕</button>
            <header className="admin-modal-head">
              <div><p>Add collection day details</p><h2>{adding.zone.name}</h2><small>{adding.weekday} · Lorry {adding.zone.assignedLorry}</small></div>
              <span className="admin-status active">{adding.weekday.slice(0, 3)}</span>
            </header>
            {error && <p className="admin-alert admin-alert--error">{error}</p>}
            <label>Waste type<select name="wasteType" required>{WASTE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
            <label>Collection time<input name="collectionTime" type="time" required /></label>
            <label>Resident guidance<textarea name="notes" placeholder="What residents should prepare" /></label>
            <footer className="admin-modal-actions">
              <button className="admin-primary" disabled={saving}>{saving ? "Saving…" : "Save collection day"}</button>
              <button type="button" className="admin-zone-delete" onClick={() => setAdding(null)}>Cancel</button>
            </footer>
          </form>
        </div>
      )}
    </section>
  );
}