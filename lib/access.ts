import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  can,
  canAccessMeeting,
  checkOrigin,
  currentUser,
  type AuthUser,
} from "@/lib/auth";
import type { Permission } from "@/lib/permissions";

type Requirement =
  | Permission
  | Permission[]
  | ((req: Request) => Permission | Permission[]);
type Options = {
  meeting?: boolean;
  superAdmin?: boolean;
  allowPasswordChange?: boolean;
  audit?: boolean;
  touchSession?: boolean;
};

export function withPermission<C>(
  requirement: Requirement | null,
  handler: (
    req: Request,
    context: C,
    user: AuthUser,
  ) => Promise<Response> | Response,
  options: Options = {},
) {
  return async (req: Request, context: C): Promise<Response> => {
    let auditId: string | undefined;
    try {
      const mutation = !["GET", "HEAD", "OPTIONS"].includes(req.method);
      if (mutation) {
        const rejected = checkOrigin(req);
        if (rejected) return rejected;
      }
      const user = await currentUser(req, options.touchSession !== false);
      if (!user)
        return NextResponse.json(
          { error: "Sign in to continue." },
          { status: 401 },
        );
      if (user.mustChangePassword && !options.allowPasswordChange) {
        return NextResponse.json(
          {
            error: "Change your temporary password before continuing.",
            code: "PASSWORD_CHANGE_REQUIRED",
          },
          { status: 403 },
        );
      }
      const needed =
        typeof requirement === "function" ? requirement(req) : requirement;
      const allowed =
        needed === null ||
        (Array.isArray(needed)
          ? needed.some((permission) => can(user, permission))
          : can(user, needed));
      if (!allowed || (options.superAdmin && !user.superAdmin)) {
        return NextResponse.json(
          { error: "You do not have permission for this action." },
          { status: 403 },
        );
      }
      if (mutation && options.superAdmin && user.verifiedAt + 10 * 60_000 <= Date.now()) {
        return NextResponse.json({ error: "Confirm your password to change security settings.", code: "REAUTH_REQUIRED" }, { status: 403 });
      }
      let meetingId: string | undefined;
      if (options.meeting) {
        const params = await (context as { params: Promise<{ id: string }> })
          .params;
        if (!canAccessMeeting(user, params.id)) {
          return NextResponse.json(
            { error: "You do not have access to this meeting." },
            { status: 403 },
          );
        }
        meetingId = params.id;
      } else {
        const requestedMeeting = new URL(req.url).searchParams.get("meetingId");
        if (requestedMeeting && canAccessMeeting(user, requestedMeeting)) meetingId = requestedMeeting;
      }
      if (mutation && options.audit !== false) {
        // Persist intent before business writes. A logging outage denies new mutations.
        const audit = await prisma.auditLog.create({
          data: {
            actorId: user.id, actorName: user.name,
            action: `${req.method} ${typeof needed === "string" ? needed : options.superAdmin ? "security.manage" : "account"}`,
            resource: new URL(req.url).pathname.slice(0, 500),
            meetingId,
            status: "STARTED",
          },
        });
        auditId = audit.id;
      }
      let response = await handler(req, context, user);
      if (auditId) {
        // STARTED remains visible if a process stops before the outcome is recorded.
        try {
        await prisma.auditLog.update({
          where: { id: auditId },
          data: { status: response.ok ? "SUCCEEDED" : "REJECTED" },
        });
        } catch (error) { console.error("Audit outcome could not be recorded", auditId, error); }
      }
      if (response.status >= 500) {
        response = NextResponse.json(
          { error: "The request could not be completed. Please try again." },
          { status: response.status },
        );
      }
      response.headers.set("Cache-Control", "private, no-store");
      response.headers.set("Vary", "Cookie");
      response.headers.set("X-Content-Type-Options", "nosniff");
      return response;
    } catch (error) {
      console.error("Authorized request failed", error);
      if (auditId) {
        try { await prisma.auditLog.update({ where: { id: auditId }, data: { status: "FAILED" } }); }
        catch { /* The persisted STARTED record still records the attempted action. */ }
      }
      // Do not expose ORM messages, password hashes, or database configuration.
      return NextResponse.json(
        { error: "The request could not be completed. Please try again." },
        { status: 500, headers: { "Cache-Control": "no-store" } },
      );
    }
  };
}
