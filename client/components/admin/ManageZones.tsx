"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Zone } from "@/types";

const PAGE_SIZE = 5;
const placeholderImage = (number: number) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360"><rect width="100%" height="100%" fill="#d8efe4"/><text x="50%" y="52%" font-family="Arial" font-size="44" font-weight="bold" fill="#0d6b4f" text-anchor="middle">Zone ${number}</text></svg>`)}`;

export default function ManageZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const [newImage, setNewImage] = useState("");
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Zone | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setZones(await api.adminZones()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load zones"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const nextZoneNumber = useMemo(() => zones.reduce((max, zone) => Math.max(max, zone.zoneNumber), 0) + 1, [zones]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return zones;
    return zones.filter((zone) => zone.name.toLowerCase().includes(term) || zone.assignedLorry.toLowerCase().includes(term) || zone.description.toLowerCase().includes(term));
  }, [zones, query]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const from = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(currentPage * PAGE_SIZE, filtered.length);

  async function saveZone(event: React.FormEvent<HTMLFormElement>, zone: Zone) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    setBusy(zone._id); setError(""); setNotice("");
    try {
      const updated = await api.updateZone(zone._id, { description: String(form.get("description")), assignedLorry: String(form.get("assignedLorry")), isActive: form.get("isActive") === "on" });
      setZones((list) => list.map((entry) => entry._id === updated._id ? updated : entry));
      setSelected((current) => current && current._id === updated._id ? updated : current);
      setNotice(`${updated.name} updated.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update zone"); }
    finally { setBusy(""); }
  }

  async function removeZone(zone: Zone) {
    if (!window.confirm(`Delete ${zone.name}? Residents will no longer see this zone. You can restore it later.`)) return;
    setBusy(zone._id); setError(""); setNotice("");
    try {
      const removed = await api.deleteZone(zone._id);
      setZones((list) => list.map((entry) => entry._id === removed._id ? removed : entry));
      setSelected((current) => current && current._id === removed._id ? removed : current);
      setNotice(`${zone.name} deleted from residents.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete zone"); }
    finally { setBusy(""); }
  }

  async function restoreZone(zone: Zone) {
    setBusy(zone._id); setError(""); setNotice("");
    try {
      const restored = await api.updateZone(zone._id, { isActive: true });
      setZones((list) => list.map((entry) => entry._id === restored._id ? restored : entry));
      setSelected((current) => current && current._id === restored._id ? restored : current);
      setNotice(`${zone.name} is active for residents again.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to restore zone"); }
    finally { setBusy(""); }
  }

  function readImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2_000_000) { setError("Choose an image under 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setNewImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function addZone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    setSavingNew(true); setError(""); setNotice("");
    try {
      const zone = await api.createZone({ name: String(form.get("name")), description: String(form.get("description")), assignedLorry: String(form.get("assignedLorry")), imageBase64: newImage || placeholderImage(nextZoneNumber), isActive: form.get("isActive") === "on" });
      setZones(await api.adminZones());
      event.currentTarget.reset(); setNewImage("");
      setAdding(false); setPage(9999);
      setNotice(`${zone.name} created.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to add zone"); }
    finally { setSavingNew(false); }
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setPage(1); }
  const openAdd = () => { setError(""); setNotice(""); setNewImage(""); setAdding(true); };

  return (
    <section className="admin-zone-manage">
      <article className="admin-panel">
        <div className="admin-panel-heading">
          <div><p>Collection network</p><h2>Zone management</h2></div>
          <div className="admin-zone-toolbar">
            <span>{filtered.length} {filtered.length === 1 ? "zone" : "zones"}</span>
            <button className="admin-primary admin-zone-add-btn" type="button" onClick={openAdd}>+ Add new zone</button>
          </div>
        </div>
        <form className="admin-users-search" onSubmit={submitSearch} role="search">
          <label className="admin-search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search by name, lorry or description" /></label>
          <button className="admin-primary" type="submit">Search</button>
          {query && <button className="admin-users-clear" type="button" onClick={() => { setQuery(""); setPage(1); }}>Clear</button>}
        </form>
        {error && <p className="admin-alert admin-alert--error">{error}</p>}{notice && <p className="admin-alert">{notice}</p>}
      </article>
      {loading ? <p className="admin-empty">Loading zones…</p> : !paged.length ? <p className="admin-empty">No zones match your search.</p> : (
        <section className="admin-zone-grid">
          {paged.map((zone) => (
            <button type="button" className="admin-zone-tile" key={zone._id} onClick={() => { setError(""); setSelected(zone); }}>
              <span className="admin-zone-tile-media">
                <img src={zone.imageBase64} alt={`${zone.name} map`} />
                <span className="admin-zone-number">Zone {zone.zoneNumber}</span>
              </span>
              <span className="admin-zone-tile-body">
                <span className="admin-zone-tile-name">{zone.name}</span>
                <span className="admin-zone-tile-lorry">Lorry {zone.assignedLorry}</span>
                <span className={`admin-status ${zone.isActive ? "active" : "suspended"}`}>{zone.isActive ? "Active" : "Inactive"}</span>
              </span>
            </button>
          ))}
        </section>
      )}
      <div className="admin-users-pagination">
        <p>Showing <b>{from}–{to}</b> of <b>{filtered.length}</b> zones</p>
        <div>
          <button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>← Prev</button>
          <span>Page <b>{currentPage}</b> of {totalPages}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next →</button>
        </div>
      </div>
      {adding && (
        <div className="admin-modal-backdrop" onClick={() => setAdding(false)}>
          <form className="admin-modal admin-zone-add" onClick={(event) => event.stopPropagation()} onSubmit={(event) => void addZone(event)}>
            <button type="button" className="admin-modal-close" onClick={() => setAdding(false)} aria-label="Close new zone form">✕</button>
            <header className="admin-modal-head">
              <div><p>Expand the network</p><h2>Add a new zone</h2><small>Created as Zone {nextZoneNumber}</small></div>
              <span aria-hidden="true" />
              <span className="admin-zone-add-number">Zone {nextZoneNumber}</span>
            </header>
            {error && <p className="admin-alert admin-alert--error">{error}</p>}
            <div className="admin-zone-add-grid">
              <label>Zone name<input name="name" defaultValue={`Zone ${nextZoneNumber}`} required /></label>
              <label>Assigned lorry<input name="assignedLorry" placeholder="e.g. RB 9999" required /></label>
            </div>
            <label>Description<textarea name="description" placeholder="Describe the collection area" /></label>
            <div className="admin-zone-image-field">
              <label>Map image <small>Optional — a placeholder is used when skipped.</small><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => readImage(event.target.files?.[0])} /></label>
              {newImage && <img className="admin-zone-add-preview" src={newImage} alt="Zone map preview" />}
            </div>
            <label className="admin-check"><input name="isActive" type="checkbox" defaultChecked /> Active for residents</label>
            <footer className="admin-modal-actions">
              <button className="admin-primary" disabled={savingNew}>{savingNew ? "Adding…" : "Add zone"}</button>
              <button type="button" className="admin-zone-delete" onClick={() => setAdding(false)}>Cancel</button>
            </footer>
          </form>
        </div>
      )}
      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <form className="admin-modal admin-zone-modal" key={selected._id} onClick={(event) => event.stopPropagation()} onSubmit={(event) => void saveZone(event, selected)}>
            <button type="button" className="admin-modal-close" onClick={() => setSelected(null)} aria-label="Close zone details">✕</button>
            <img className="admin-zone-modal-media" src={selected.imageBase64} alt={`${selected.name} map`} />
            <header className="admin-modal-head">
              <div><p>Collection zone</p><h2>{selected.name}</h2><small>Lorry {selected.assignedLorry}</small></div>
              <span className={`admin-status ${selected.isActive ? "active" : "suspended"}`}>{selected.isActive ? "Active" : "Inactive"}</span>
            </header>
            {error && <p className="admin-alert admin-alert--error">{error}</p>}
            <label>Description<textarea name="description" defaultValue={selected.description} /></label>
            <label>Assigned lorry<input name="assignedLorry" defaultValue={selected.assignedLorry} required /></label>
            <label className="admin-check"><input name="isActive" type="checkbox" defaultChecked={selected.isActive} /> Active for residents</label>
            <footer className="admin-modal-actions">
              <button className="admin-primary" disabled={busy === selected._id}>Save zone</button>
              {selected.isActive ? (
                <button type="button" className="admin-zone-delete" disabled={busy === selected._id} onClick={() => void removeZone(selected)}>Delete</button>
              ) : (
                <button type="button" className="admin-zone-restore" disabled={busy === selected._id} onClick={() => void restoreZone(selected)}>Restore</button>
              )}
            </footer>
          </form>
        </div>
      )}
    </section>
  );
}