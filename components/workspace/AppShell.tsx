"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/general/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, can } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 761px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  const projection = /^\/meetings\/[^/]+\/(live|attendance\/live)$/.test(
    pathname,
  );
  if (projection) return <div className="projection-layout">{children}</div>;
  const accountSetup =
    pathname === "/account/password" && user?.mustChangePassword;
  const workspace = !!user && pathname !== "/login" && !accountSetup;
  const links = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    ...(can("meetings.view")
      ? [{ href: "/meetings", label: "Meetings", icon: CalendarDays }]
      : []),
    ...(can("shareholders.view")
      ? [{ href: "/shareholders", label: "Shareholders", icon: Users }]
      : []),
    ...(user?.superAdmin
      ? [{ href: "/admin", label: "Users & Roles", icon: ShieldCheck }]
      : []),
    ...(can("audit.view")
      ? [{ href: "/audit", label: "Audit History", icon: ClipboardList }]
      : []),
  ];
  const active = links.find((link) =>
    link.href === "/" ? pathname === "/" : pathname.startsWith(link.href),
  );
  async function logout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok && response.status !== 401)
        throw new Error("Sign-out failed. Please try again.");
      window.location.assign("/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign-out failed.");
      setBusy(false);
    }
  }
  const navigation = (
    <>
      <Link href="/" className="workspace-brand" onClick={() => setOpen(false)}>
        <span className="brand-mark">
          <Image src="/logo.svg" alt="Lucy" width={47} height={32} />
        </span>
        <span>
          <strong>Lucy Voting</strong>
          <small>Shareholder workspace</small>
        </span>
      </Link>
      <p className="nav-caption">WORKSPACE</p>
      <nav aria-label="Main navigation" className="workspace-nav">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={
              (href === "/" ? pathname === "/" : pathname.startsWith(href))
                ? "page"
                : undefined
            }
            onClick={() => setOpen(false)}>
            <Icon size={19} />
            <span>{label}</span>
            <ChevronRight size={14} />
          </Link>
        ))}
      </nav>
      <div className="sidebar-note">
        <ShieldCheck size={22} />
        <strong>Every vote accounted for</strong>
        <p>One workspace for your registry, meetings and elections.</p>
      </div>
      <Link
        href="/account/password"
        className="sidebar-account"
        aria-label="Account settings"
        onClick={() => setOpen(false)}>
        <span className="avatar">{user?.name.slice(0, 1).toUpperCase()}</span>
        <div>
          <strong>{user?.name}</strong>
          <small>{user?.roleName}</small>
        </div>
      </Link>
    </>
  );
  if (!workspace)
    return (
      <div className="public-layout">
        <header className="public-header">
          <Link href="/" className="public-brand">
            <Image src="/logo.svg" alt="Lucy" width={56} height={37} />
            <strong>Lucy Voting</strong>
          </Link>
          <div>
            <ThemeToggle />
            {user ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void logout()}>
                Sign out
              </Button>
            ) : (
              pathname !== "/login" && (
                <Button asChild>
                  <Link href="/login">
                    Sign in
                    <ArrowUpRight />
                  </Link>
                </Button>
              )
            )}
          </div>
        </header>
        {error && (
          <p role="alert" className="error-notice">
            {error}
          </p>
        )}
        <div id="workspace-content" className="public-content" tabIndex={-1}>
          {children}
        </div>
        <footer className="public-footer">
          Lucy · Shareholder voting and meeting management
        </footer>
      </div>
    );
  return (
    <div className="workspace-shell">
      <a href="#workspace-content" className="skip-link">
        Skip to content
      </a>
      <aside className="workspace-sidebar">{navigation}</aside>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div>
            <Button
              ref={menuRef}
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Open navigation"
              aria-expanded={open}
              onClick={() => setOpen(true)}>
              <Menu />
            </Button>
            <span className="workspace-breadcrumb">
              Workspace
              <ChevronRight size={14} />
              <strong>
                {pathname.startsWith("/account")
                  ? "Account settings"
                  : (active?.label ?? "Meeting")}
              </strong>
            </span>
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            <Link href="/account/password" className="topbar-account">
              <span className="avatar">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <span>
                <strong>{user.name}</strong>
                <small>{user.roleName}</small>
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => void logout()}>
              <LogOut />
              {busy ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </header>
        {error && (
          <p role="alert" className="error-notice">
            {error}
          </p>
        )}
        <div id="workspace-content" className="workspace-content" tabIndex={-1}>
          {children}
        </div>
        <footer className="workspace-footer">
          <span>Lucy Voting</span>
          <span>Shareholder workspace</span>
        </footer>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="mobile-navigation translate-x-0 translate-y-0"
          showCloseButton={false}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            menuRef.current?.focus();
          }}>
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <DialogDescription className="sr-only">
            Choose a workspace section.
          </DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            className="mobile-close"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}>
            <X />
          </Button>
          {navigation}
        </DialogContent>
      </Dialog>
    </div>
  );
}
