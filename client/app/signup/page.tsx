"use client";

import ZoneCard from "@/components/zones/ZoneCard";
import PasswordStrength from "@/components/common/PasswordStrength";
import PasswordField from "@/components/common/PasswordField";
import { api } from "@/lib/api";
import { setPendingEmail } from "@/lib/auth-storage";
import { passwordIssues } from "@/lib/password";
import type { Zone } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read the profile image"));
    reader.readAsDataURL(file);
  });
}

export default function Signup() {
  const router = useRouter();
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    api.zones().then(setZones).catch((requestError) => setError(requestError.message));
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirmPassword"))) return setError("Passwords do not match");
    if (passwordIssues(password).length) return setError(`Choose a stronger password. It must include: ${passwordIssues(password).join(", ")}.`);
    if (!selectedZone) return setError("Select your waste collection zone");

    const profileFile = form.get("profileImage") as File;
    try {
      setSubmitting(true);
      let profileImage: string | undefined;
      if (profileFile?.size) {
        if (profileFile.size > 2_000_000) throw new Error("Choose a profile image smaller than 2 MB");
        profileImage = await fileToBase64(profileFile);
      }
      const email = String(form.get("email"));
      await api.register({ name: String(form.get("name")), email, phone: String(form.get("phone")), address: String(form.get("address")), password, zoneId: selectedZone._id, profileImage });
      setPendingEmail(email);
      router.push("/verify-email");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create your account");
    } finally {
      setSubmitting(false);
    }
  }

  return <section className="auth-shell auth-shell--signup">
    <div className="auth-orbit auth-orbit--signup" aria-hidden="true"><i /><b /><em /></div>
    <form className="signup-form auth-card auth-card--wide" onSubmit={submit}>
      <div className="auth-heading"><span className="np-sticker np-sticker--pink">Resident registration</span><h1>Create your account</h1><p>Enter your details, add your address and phone number, then choose the zone shown on your local collection map.</p></div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="form-grid">
        <label>Full name<input name="name" autoComplete="name" placeholder="Your full name" required /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
        <label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="07X XXX XXXX" required /></label>
        <label>Home address<input name="address" autoComplete="street-address" placeholder="House number, street, area" required /></label>
        <label>Password<PasswordField name="password" autoComplete="new-password" minLength={8} placeholder="Minimum 8 characters" required value={password} onChange={setPassword} /></label>
        <label>Confirm password<PasswordField name="confirmPassword" autoComplete="new-password" minLength={8} placeholder="Re-enter password" required /></label>
      </div>
      <PasswordStrength password={password} />
      <label>Profile image <span className="optional">(optional)</span><input name="profileImage" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /></label>
      <fieldset className="zone-fieldset"><legend>Select your zone</legend><p className="muted">Hover or tap each map to clearly preview your collection area and assigned lorry.</p><div className="zone-signup-grid">{zones.map(zone => <ZoneCard key={zone._id} zone={zone} selected={selectedZone?._id === zone._id} onSelect={setSelectedZone} />)}</div></fieldset>
      {selectedZone && <div className="lorry-assignment"><span>Assigned collection lorry</span><strong>{selectedZone.assignedLorry}</strong><small>{selectedZone.name}</small></div>}
      <button disabled={submitting || !selectedZone}>{submitting ? "Creating account…" : "Create account"}</button>
      <p className="auth-switch">Already have an account? <Link href="/login">Log in</Link></p>
    </form>
  </section>;
}
