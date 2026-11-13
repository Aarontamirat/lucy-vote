"use client";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { ErrorNotice } from "@/components/workspace/Feedback";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sign-in failed.");
      const next =
        new URLSearchParams(window.location.search).get("next") ?? "/";
      const safe =
        next.startsWith("/") &&
        !next.startsWith("//") &&
        !/[\\\r\n]/.test(next) &&
        new URL(next, window.location.origin).origin === window.location.origin;
      window.location.assign(
        data.mustChangePassword ? "/account/password" : safe ? next : "/",
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign-in failed.");
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-story">
        <p className="eyebrow">WELCOME TO LUCY</p>
        <h1>
          Your meetings.
          <br />
          <span>Your voice.</span>
        </h1>
        <p>
          A focused workspace for the people behind every shareholder meeting
          and election.
        </p>
        <ul>
          <li>
            <CheckCircle2 size={18} />
            Keep your shareholder registry organised
          </li>
          <li>
            <CheckCircle2 size={18} />
            Run attendance and weighted elections
          </li>
          <li>
            <CheckCircle2 size={18} />
            See clear results and accountable activity
          </li>
        </ul>
      </section>
      <form onSubmit={submit} className="auth-form">
        <h2>Sign in</h2>
        <p>Enter the account provided by your administrator.</p>
        <div className="field-group">
          <label htmlFor="email">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@organisation.com"
            autoComplete="username"
            maxLength={191}
            required
            disabled={busy}
          />
        </div>
        <div className="field-group">
          <label htmlFor="password">Password</label>
          <div className="password-field">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              maxLength={128}
              required
              disabled={busy}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
        </div>
        {error && <ErrorNotice message={error} />}
        <Button className="auth-submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
          <ArrowRight />
        </Button>
        <div className="auth-footnote">
          <LockKeyhole size={12} />
          Need an account or password reset? Contact your Super Admin.
        </div>
        <div className="auth-footnote">
          <ShieldCheck size={13} />
          Access is managed by your organisation.
        </div>
      </form>
    </main>
  );
}
