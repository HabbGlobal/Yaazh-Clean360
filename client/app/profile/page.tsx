"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ResidentNav from "@/components/common/ResidentNav";
import { api, zoneMapUrl } from "@/lib/api";
import { clearToken } from "@/lib/auth-storage";
import { useGuard } from "@/lib/use-guard";
import type { User, Zone } from "@/types";

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const router = useRouter();
  const { user: guardedUser, loading } = useGuard("resident");
  const [user, setUser] = useState<User | undefined>(guardedUser || undefined);
  const activeUser = user || guardedUser;
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const zone = typeof activeUser?.zoneId === "string" ? undefined : activeUser?.zoneId as Zone | undefined;

  useEffect(() => {
    api.zones().then(setZones).catch(() => undefined);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("profileImage") as File;
    try {
      let profileImage: string | undefined;
      if (file?.size) {
        if (file.size > 2_000_000) throw new Error("Choose an image smaller than 2 MB");
        profileImage = await fileToBase64(file);
      }
      const updated = await api.updateProfile({
        name: String(form.get("name")),
        phone: String(form.get("phone")),
        address: String(form.get("address")),
        ...(profileImage ? { profileImage } : {})
      });
      setUser(updated);
      setMessage("Profile saved");
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save profile");
    }
  }

  async function deleteAccount() {
    if (confirmDelete.trim().toUpperCase() !== "DELETE") {
      setError("Type DELETE to confirm account deletion");
      return;
    }
    try {
      await api.deleteMe();
      clearToken();
      router.push("/signup");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete account");
    }
  }

  async function changeZone(zoneId: string) {
    try {
      const updated = await api.selectZone(zoneId);
      setUser((currentUser) => ({ ...(currentUser || activeUser!), ...updated }));
      setMessage("Collection zone updated");
      setError("");
      setZoneModalOpen(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update zone");
    }
  }

  if (loading || !activeUser) return <section className="resident-dashboard resident-dashboard--loading"><p>Loading profile...</p></section>;

  return (
    <section className="resident-dashboard profile-dashboard">
      <ResidentNav user={activeUser} />
      <div className="resident-container">
        <header className="resident-hero profile-hero">
          <div>
            <p className="np-sticker np-sticker--mint">Resident profile</p>
            <h1>Manage your Clean360 identity.</h1>
            <p>Keep your contact details, address, profile image, and selected zone information accurate for collection service updates.</p>
          </div>
          <aside className="resident-lorry-card profile-summary-card">
            {activeUser.profileImage ? <img className="profile-summary-avatar" src={activeUser.profileImage} alt="" /> : <span className="profile-summary-avatar">{activeUser.name.slice(0, 1).toUpperCase()}</span>}
            <strong>{activeUser.name}</strong>
            <small>{activeUser.email}</small>
          </aside>
        </header>

        {error && <p className="error resident-error">{error}</p>}
        {message && <p className="resident-message">{message}</p>}

        <div className="resident-grid">
          <form className="resident-card resident-card--wide profile-form" onSubmit={submit}>
            <div className="resident-card-head"><span>Edit Profile</span><strong>Resident details</strong></div>
            <div className="profile-form-grid">
              <label>Full name<input name="name" defaultValue={activeUser.name} required /></label>
              <label>Email address<input value={activeUser.email} disabled /></label>
              <label>Phone number<input name="phone" type="tel" defaultValue={activeUser.phone || ""} required /></label>
              <label>Home address<input name="address" defaultValue={activeUser.address || ""} required /></label>
              <label className="profile-file">Profile image<input name="profileImage" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /></label>
            </div>
            <button>Save profile</button>
          </form>

          <article className="resident-card profile-zone-card">
            <div className="resident-card-head"><span>Selected Zone</span><strong>{zone?.assignedLorry || "No lorry"}</strong></div>
            {zone ? <img src={zoneMapUrl(zone._id)} alt={`${zone.name} map`} /> : <p className="muted">No zone selected.</p>}
            <h3>{zone?.name || "Select a zone"}</h3>
            <p>{zone?.description || "Choose your collection area to receive schedule updates."}</p>
            <button className="resident-button" type="button" onClick={() => setZoneModalOpen(true)}>Change zone</button>
          </article>

          <article className="resident-card profile-danger-card">
            <div className="resident-card-head"><span>Danger Zone</span><strong>Delete account</strong></div>
            <h3>Delete my account</h3>
            <p>This removes your resident account, readiness votes, complaints, and feedback records. Type DELETE to confirm.</p>
            <input value={confirmDelete} onChange={(event) => setConfirmDelete(event.target.value)} placeholder="Type DELETE" />
            <button type="button" onClick={deleteAccount}>Delete my account</button>
          </article>
        </div>
      </div>
      {zoneModalOpen && (
        <div className="zone-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="zone-modal-heading">
          <div className="zone-modal">
            <div className="resident-card-head"><span>Choose Zone</span><strong id="zone-modal-heading">Full map preview</strong></div>
            <p>Pick the map that clearly matches your collection area. Your assigned lorry updates immediately.</p>
            <div className="zone-modal-grid">
              {zones.map((item) => (
                <button className={item._id === zone?._id ? "active" : ""} type="button" onClick={() => changeZone(item._id)} key={item._id}>
                  <img className="zone-modal-thumb" src={zoneMapUrl(item._id)} alt={`${item.name} map`} />
                  <span className="zone-modal-preview" aria-hidden="true"><img src={zoneMapUrl(item._id)} alt="" /></span>
                  <span><b>{item.name}</b><small>{item.assignedLorry}</small></span>
                </button>
              ))}
            </div>
            <button className="zone-modal-close" type="button" onClick={() => setZoneModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
}
