"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api";
import { setToken } from "@/lib/auth-storage";

type AuthMode = "login" | "forgot" | "reset";

function PasswordField({ name, autoComplete, placeholder, required }: { name: string; autoComplete: string; placeholder: string; required?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="password-field">
      <input name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} required={required} />
      <button
        type="button"
        className="password-toggle"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18" /><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 6.5 10 6.5a18.4 18.4 0 0 1-3.2 4M6.3 6.3A18 18 0 0 0 2 11.5S5.5 18 12 18a9.7 9.7 0 0 0 4.7-1.2" /><path d="M9.9 9.9a2.8 2.8 0 0 0 4 4" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>
        )}
      </button>
    </span>
  );
}

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      setLoading(true);
      const result = await api.login({ email: String(form.get("email")), password: String(form.get("password")) });
      setToken(result.token);
      router.push(result.user.role === "admin" ? "/admin" : result.user.zoneId ? "/dashboard" : "/select-zone");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function requestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const resetEmail = String(form.get("email"));
    try {
      setLoading(true);
      const result = await api.forgotPassword(resetEmail);
      setEmail(resetEmail);
      setMessage(result.message);
      setMode("reset");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send reset code");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirmPassword"))) {
      setError("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const result = await api.resetPassword({ email, code: String(form.get("code")), password });
      setToken(result.token);
      router.push(result.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-shell auth-shell--login">
      <div className="auth-orbit" aria-hidden="true"><i /><b /><em /></div>
      <div className="auth-card">
        <div className="auth-card__intro">
          <p className="np-sticker np-sticker--yellow">Secure resident access</p>
          <h1>{mode === "login" ? "Welcome back to Yaazh Clean360." : mode === "forgot" ? "Recover your account." : "Enter your reset code."}</h1>
          <p>
            Sign in to view your collection schedule, assigned zone lorry, readiness voting and complaint updates.
          </p>
          <div className="auth-card__stats" aria-hidden="true">
            <span><strong>6</strong>Collection days</span>
            <span><strong>5</strong>Zone lorries</span>
            <span><strong>24h</strong>Issue reporting</span>
          </div>
        </div>

        <div className="auth-card__form">
          <div className="auth-tabs" aria-label="Authentication options">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Login</button>
            <Link href="/signup">Sign up</Link>
          </div>

          {error && <p className="error auth-alert" role="alert">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          {mode === "login" && (
            <form className="auth-panel-form" onSubmit={submitLogin}>
              <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
              <label>Password<PasswordField name="password" autoComplete="current-password" placeholder="Your password" required /></label>
              <button disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
              <button type="button" className="auth-text-button" onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}>Forgotten your password?</button>
            </form>
          )}

          {mode === "forgot" && (
            <form className="auth-panel-form" onSubmit={requestReset}>
              <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" defaultValue={email} required /></label>
              <button disabled={loading}>{loading ? "Sending code..." : "Send reset OTP"}</button>
              <button type="button" className="auth-text-button" onClick={() => setMode("login")}>Back to login</button>
            </form>
          )}

          {mode === "reset" && (
            <form className="auth-panel-form" onSubmit={resetPassword}>
              <label>Email address<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /></label>
              <label>OTP code<input name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="6-digit code" required /></label>
              <label>New password<input name="password" type="password" autoComplete="new-password" minLength={8} placeholder="Minimum 8 characters" required /></label>
              <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} placeholder="Re-enter password" required /></label>
              <button disabled={loading}>{loading ? "Resetting..." : "Reset password and open dashboard"}</button>
              <button type="button" className="auth-text-button" onClick={() => setMode("forgot")}>Send another OTP</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
