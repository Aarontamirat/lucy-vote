import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie } from "@/lib/auth";
import { withPermission } from "@/lib/access";

export const POST = withPermission(null, async (_req, _context, user) => {
  await prisma.session.deleteMany({ where: { id: user.sessionId } });
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}, { allowPasswordChange: true });
