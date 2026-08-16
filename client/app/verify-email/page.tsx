"use client";

import { api } from "@/lib/api";
import { clearPendingEmail, getPendingEmail, setPendingEmail, setToken } from "@/lib/auth-storage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmail() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setEmail(getPendingEmail() || ""), []);

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      setLoading(true);
      const code = String(new FormData(event.currentTarget).get("code"));
      const result = await api.verifyEmail({ email, code });
      setToken(result.token);
      clearPendingEmail();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify email");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError("");
    setMessage("");
    try {
      setLoading(true);
      setMessage((await api.resendOtp(email)).message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-shell auth-shell--login">
      <div className="auth-orbit" aria-hidden="true"><i /><b /><em /></div>
      <div className="auth-card">
        <div className="auth-card__intro">
          <p className="np-sticker np-sticker--mint">Account activation</p>
          <h1>Verify your email</h1>
          <p>Enter the six-digit code we emailed you to activate your account and open your resident dashboard.</p>
          <div className="auth-card__stats" aria-hidden="true">
            <span><strong>6</strong>Digit code</span>
            <span><strong>1</strong>Activation</span>
            <span><strong>∞</strong>Retries</span>
          </div>
        </div>
        <div className="auth-card__form">
          <p className="auth-lead">We sent a one-time code to <strong>{email || "your email"}</strong>.</p>
          {error && <p className="error auth-alert" role="alert">{error}</p>}
          {message && <p className="auth-message">{message}</p>}
          <form className="auth-panel-form" onSubmit={verify}>
            <label>Email address<input value={email} onChange={(event) => { setEmail(event.target.value); setPendingEmail(event.target.value); }} type="email" autoComplete="email" required /></label>
            <label>Verification code<input name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="6-digit code" autoComplete="one-time-code" required /></label>
            <button disabled={loading}>{loading ? "Verifying..." : "Verify email"}</button>
            <button type="button" className="auth-text-button" onClick={resend} disabled={loading}>Resend code</button>
          </form>
        </div>
      </div>
    </section>
  );
}