import { NextResponse } from "next/server";
import { z } from "zod";
import { AdminError } from "@/lib/security-admin";

export function adminErrorResponse(error: unknown): NextResponse {
  if (error instanceof AdminError) return NextResponse.json({ error: error.message, ...(error.code ? { code: error.code } : {}) }, { status: error.status });
  if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues.map((issue) => issue.message).join(" ") }, { status: 400 });
  if (error instanceof SyntaxError) return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  if (typeof error === "object" && error !== null && "code" in error) {
    if (error.code === "P2002") return NextResponse.json({ error: "That email or role name is already in use." }, { status: 409 });
    if (error.code === "P2003") return NextResponse.json({ error: "The selected role or meeting is no longer available." }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }
  throw error;
}
