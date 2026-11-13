"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { ThemeToggle } from "../general/theme-toggle";
import { useAuth } from "@/components/auth/AuthProvider";
export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const { user, can } = useAuth();
  const links = [
    ...(can("shareholders.view") ? [{ href: "/shareholders", label: "Shareholders" }] : []),
    ...(can("meetings.view") ? [{ href: "/meetings", label: "Meetings" }] : []),
    ...(user?.superAdmin ? [{ href: "/admin", label: "Users & Roles" }] : []),
    ...(can("audit.view") ? [{ href: "/audit", label: "Audit History" }] : []),
  ];
  async function logout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (response.ok || response.status === 401) window.location.assign("/login");
    else setError("Sign-out failed. Please try again.");
  }
  return <nav className="sticky top-0 z-50 bg-gray-100 text-gray-900 shadow-md dark:bg-gray-900 dark:text-neutral-100 print:hidden">
    <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4">
      <Link href="/" className="flex items-center gap-2"><Image src="/logo.svg" width={56} height={56} alt="Voting System" /><span className="text-lg font-bold text-cyan-800 dark:text-cyan-300">Voting System</span></Link>
      <div className="hidden items-center gap-4 md:flex">{links.map((link) => <Link key={link.href} href={link.href} className="text-sm hover:underline">{link.label}</Link>)}</div>
      <div className="flex items-center gap-3"><ThemeToggle />{user ? <><Link href="/account/password" className="hidden text-right text-xs sm:block"><span className="block font-semibold">{user.name}</span>{user.roleName}</Link><Button size="sm" variant="outline" onClick={() => void logout()}>Sign out</Button></> : <Link href="/login" className="text-sm font-semibold">Sign in</Link>}
      <button className="md:hidden" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>
    </div>{error && <p role="alert" className="p-2 text-center text-sm text-red-600">{error}</p>}
    {open && <div className="flex flex-col gap-3 border-t p-4 md:hidden">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}{user && <Link href="/account/password" onClick={() => setOpen(false)}>Change password</Link>}</div>}
  </nav>;
};
