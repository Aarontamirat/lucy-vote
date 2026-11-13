import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  effectivePermissions,
  isReservedPermission,
  SUPER_ADMIN_ROLE_ID,
  type Permission,
} from "@/lib/permissions";

function usesSecureSessionCookie() {
  const origin = process.env.AUTH_ORIGIN;
  if (origin) {
    try {
      // Browsers reject Secure cookies on HTTP LAN hosts, even in production.
      // Use the browser-facing origin so HTTPS proxies retain Secure cookies.
      return new URL(origin).protocol !== "http:";
    } catch {
      // Invalid origin configuration must never downgrade cookie security.
      return true;
    }
  }
  return process.env.NODE_ENV === "production";
}

const SECURE_SESSION_COOKIE = usesSecureSessionCookie();
export const SESSION_COOKIE = SECURE_SESSION_COOKIE
  ? "__Host-voting-session"
  : "voting-session";
export const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
export const SESSION_IDLE_MS = 30 * 60 * 1000;
export const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  superAdmin: boolean;
  accessScope: "ALL" | "ASSIGNED";
  mustChangePassword: boolean;
  permissions: Permission[];
  meetingIds: string[];
  sessionId: string;
  verifiedAt: number;
};

function requestToken(req: Request) {
  const matches = (req.headers.get("cookie") ?? "")
    .split(";")
    .map((item) => item.trim())
    .filter((item) => item.startsWith(`${SESSION_COOKIE}=`));
  // Ambiguous cookie values fail closed.
  return matches.length === 1
    ? matches[0].slice(SESSION_COOKIE.length + 1)
    : null;
}

export async function currentUser(
  req?: Request,
  touch = true,
): Promise<AuthUser | null> {
  const token = req
    ? requestToken(req)
    : (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: tokenHash(token) },
    include: {
      user: {
        include: {
          role: { include: { permissions: true } },
          overrides: true,
          meetingAssignments: true,
        },
      },
    },
  });
  const now = Date.now();
  if (
    !session ||
    !session.user.active ||
    session.expiresAt.getTime() <= now ||
    session.lastSeenAt.getTime() + SESSION_IDLE_MS <= now
  )
    return null;
  // Refresh activity without extending the absolute session expiry.
  if (touch && now - session.lastSeenAt.getTime() >= 60_000) {
    const touched = await prisma.session.updateMany({
      where: {
        id: session.id,
        expiresAt: { gt: new Date(now) },
        lastSeenAt: { gt: new Date(now - SESSION_IDLE_MS) },
      },
      data: { lastSeenAt: new Date(now) },
    });
    if (!touched.count) return null;
  }
  const user = session.user;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roleId: user.roleId,
    roleName: user.role.name,
    superAdmin: user.roleId === SUPER_ADMIN_ROLE_ID,
    accessScope: user.accessScope,
    mustChangePassword: user.mustChangePassword,
    permissions: effectivePermissions(user),
    meetingIds: user.meetingAssignments.map((item) => item.meetingId),
    sessionId: session.id,
    verifiedAt: session.verifiedAt.getTime(),
  };
}

export const can = (user: AuthUser, permission: Permission) =>
  user.superAdmin ||
  (!isReservedPermission(permission) && user.permissions.includes(permission));
export const canAccessMeeting = (user: AuthUser, id: string) =>
  user.superAdmin || user.meetingIds.includes(id);

export function publicUser(user: AuthUser) {
  const { sessionId: _sessionId, ...safe } = user;
  return safe;
}

export function checkOrigin(req: Request): NextResponse | null {
  const configured = process.env.AUTH_ORIGIN;
  if (!configured && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Application origin has not been configured." },
      { status: 503 },
    );
  }
  let expected: string;
  try {
    expected = new URL(configured ?? req.url).origin;
  } catch {
    return NextResponse.json(
      { error: "Invalid application origin configuration." },
      { status: 503 },
    );
  }
  const fetchSite = req.headers.get("sec-fetch-site");
  if (
    req.headers.get("origin") !== expected ||
    (fetchSite && !["same-origin", "none"].includes(fetchSite))
  ) {
    return NextResponse.json(
      { error: "Request origin is not allowed." },
      { status: 403 },
    );
  }
  return null;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await prisma.session.create({
    data: { userId, tokenHash: tokenHash(token), expiresAt },
  });
  return { token, expiresAt };
}

export function setSessionCookie(
  res: NextResponse,
  token: string,
  expiresAt: Date,
) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: SECURE_SESSION_COOKIE,
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: NextResponse) {
  setSessionCookie(res, "", new Date(0));
}
