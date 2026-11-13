import { NextResponse } from "next/server";
import { publicUser } from "@/lib/auth";
import { withPermission } from "@/lib/access";

export const GET = withPermission(null, (_req, _context, user) => NextResponse.json({ user: publicUser(user) }), { allowPasswordChange: true, touchSession: false });
