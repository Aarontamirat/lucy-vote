"use client";
import { useState } from "react";
import { ArrowRight, KeyRound, CheckCircle2 } from "lucide-react";
import { ErrorNotice } from "@/components/workspace/Feedback";
import { useAuth } from "@/components/auth/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PasswordPage() {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("newPassword") !== form.get("confirmPassword")) {
      setError("The new passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.get("currentPassword"),
          newPassword: form.get("newPassword"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.assign("/");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Password change failed.",
      );
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-story">
        <p className="eyebrow">ACCOUNT SECURITY</p>
        <h1>
          A password
          <br />
          <span>only you know.</span>
        </h1>
        <p>
          {user?.mustChangePassword
            ? "Complete your account setup by replacing the temporary password your administrator gave you."
            : "Update your password here. Your other sessions will be signed out."}
        </p>
        <ul>
          <li>
            <CheckCircle2 size={18} />
            Use at least 12 characters
          </li>
          <li>
            <CheckCircle2 size={18} />
            Choose a password you have not used here before
          </li>
          <li>
            <KeyRound size={18} />
            Keep your sign-in details private
          </li>
        </ul>
      </section>
      <form onSubmit={submit} className="auth-form">
        <h2>Change password</h2>
        <p>
          {user?.mustChangePassword
            ? "One final step before you enter your workspace."
            : "Enter your current password and choose a new one."}
        </p>
        <div className="field-group">
          <label htmlFor="current-password">Current password</label>
          <Input
            id="current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            disabled={busy}
          />
        </div>
        <div className="field-group">
          <label htmlFor="new-password">New password</label>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
            disabled={busy}
          />
          <small>Between 12 and 128 characters.</small>
        </div>
        <div className="field-group">
          <label htmlFor="confirm-password">Confirm new password</label>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
            disabled={busy}
          />
        </div>
        {error && <ErrorNotice message={error} />}
        <Button className="auth-submit" disabled={busy}>
          {busy ? "Saving…" : "Change password"}
          <ArrowRight />
        </Button>
      </form>
    </main>
  );
}
