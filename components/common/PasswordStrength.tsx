"use client";

import { passwordStrength } from "@/lib/password";

export default function PasswordStrength({ password }: { password: string }) {
  const { score, label } = passwordStrength(password);
  const tone = label === "Very strong" ? "very" : label === "Strong" ? "strong" : "poor";
  const filled = label === "Very strong" ? 3 : label === "Strong" ? 2 : 1;
  return (
    <div className="password-strength" aria-live="polite">
      <div className="password-strength__head">
        <span>Password strength</span>
        {password ? <b className={`password-strength__label password-strength__label--${tone}`}>{label}</b> : <span className="password-strength__idle">Not set</span>}
      </div>
      <div className="password-strength__meter" aria-hidden="true">
        {[1, 2, 3].map((segment) => <i key={segment} className={`password-strength__seg${segment <= filled ? ` password-strength__seg--on--${tone}` : ""}`} />)}
      </div>
    </div>
  );
}