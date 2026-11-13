import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";
import { createShareholderTemplate } from "@/lib/shareholder-import";
import { SHAREHOLDER_TEMPLATE_FILENAME } from "@/lib/shareholder-import-config";

export const runtime = "nodejs";

function handleGET() {
  return new NextResponse(new Uint8Array(createShareholderTemplate()), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${SHAREHOLDER_TEMPLATE_FILENAME}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export const GET = withPermission("shareholders.import", handleGET);
