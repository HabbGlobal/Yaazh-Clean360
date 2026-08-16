export const PASSWORD_RULES: Array<{ test: (value: string) => boolean; label: string }> = [
  { test: (value) => value.length >= 8, label: "At least 8 characters" },
  { test: (value) => /[a-z]/.test(value), label: "A lowercase letter" },
  { test: (value) => /[A-Z]/.test(value), label: "An uppercase letter" },
  { test: (value) => /[0-9]/.test(value), label: "A number" },
  { test: (value) => /[^A-Za-z0-9]/.test(value), label: "A special character (!@#$%^&*)" }
];

export type PasswordStrengthLabel = "Poor" | "Strong" | "Very strong";

export interface PasswordScore {
  score: number;
  label: PasswordStrengthLabel;
}

export function passwordStrength(password: string): PasswordScore {
  if (!password) return { score: 0, label: "Poor" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  const label: PasswordStrengthLabel = score >= 5 ? "Very strong" : score >= 3 ? "Strong" : "Poor";
  return { score, label };
}

export function passwordIssues(password: string) {
  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.label);
}