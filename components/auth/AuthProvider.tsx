"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { AuthUser } from "@/lib/auth";
import { isReservedPermission, type Permission } from "@/lib/permissions";

export type PublicUser = Omit<AuthUser, "sessionId">;
type AuthContextValue = {
  user: PublicUser | null;
  can: (permission: Permission) => boolean;
  refresh: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue>({
  user: null,
  can: () => false,
  refresh: async () => {},
});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: PublicUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState(initialUser);
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (response.status === 401) setUser(null);
      else if (response.ok) setUser((await response.json()).user);
    } catch {
      /* A network outage does not grant additional permissions. */
    }
  }, []);
  useEffect(() => {
    const timer = setInterval(refresh, 60_000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);
  return (
    <AuthContext.Provider
      value={{
        user,
        can: (permission) =>
          !!user &&
          (user.superAdmin ||
            (!isReservedPermission(permission) &&
              user.permissions.includes(permission))),
        refresh,
      }}>
      <AuthGate>{children}</AuthGate>
    </AuthContext.Provider>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const publicPage =
    ["/", "/login", "/access-denied"].includes(pathname) ||
    /^\/meetings\/[^/]+\/(live|attendance\/live)$/.test(pathname);
  useEffect(() => {
    if (publicPage) return;
    if (!user)
      window.location.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (user.mustChangePassword && pathname !== "/account/password")
      window.location.replace("/account/password");
  }, [user, pathname, publicPage]);
  if (!publicPage && !user)
    return <div className="p-8 text-center">Redirecting to sign-in…</div>;
  if (
    !publicPage &&
    user?.mustChangePassword &&
    pathname !== "/account/password"
  )
    return null;
  if (!publicPage && user) {
    const match = pathname.match(/^\/meetings\/([^/]+)/);
    if (
      match &&
      !user.superAdmin &&
      !user.meetingIds.includes(decodeURIComponent(match[1]))
    ) {
      return (
        <div className="p-8 text-center">
          You do not have access to this meeting.{" "}
          <Link className="underline" href="/">
            Return home
          </Link>
        </div>
      );
    }
  }
  return children;
}
