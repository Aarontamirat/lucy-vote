import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  SHAREHOLDER_IMPORT_MAX_BYTES,
  SHAREHOLDER_IMPORT_MAX_ISSUES,
  validateShareholderImportFile,
} from "@/lib/shareholder-import-config";
import {
  parseShareholderWorkbook,
  ShareholderImportError,
  shareholderIdKey,
} from "@/lib/shareholder-import";

export const runtime = "nodejs";

async function readImportForm(req: Request): Promise<FormData> {
  // Bound the whole request before multipart parsing, including chunked uploads.
  const maxRequestBytes = SHAREHOLDER_IMPORT_MAX_BYTES + 64 * 1024;
  const tooLarge = () => new ShareholderImportError(
    "The upload is too large. Select an Excel workbook that is 5 MB or smaller.",
    [], 0, 413,
  );
  if (Number(req.headers.get("content-length")) > maxRequestBytes) throw tooLarge();
  const reader = req.body?.getReader();
  if (!reader) throw new Error("Missing upload body");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxRequestBytes) {
        await reader.cancel();
        throw tooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return new Response(new Uint8Array(Buffer.concat(chunks)), {
    headers: { "Content-Type": req.headers.get("content-type") ?? "" },
  }).formData();
}

async function handlePOST(req: Request) {
  try {
    let formData: FormData;
    try {
      formData = await readImportForm(req);
    } catch (error) {
      if (error instanceof ShareholderImportError) throw error;
      return NextResponse.json(
        { error: "Upload an Excel file using the import form." },
        { status: 400 },
      );
    }
    const file = formData.get("file");
    if (!file || typeof file === "string" || formData.getAll("file").length !== 1) {
      return NextResponse.json(
        { error: "Select one Excel file to import." },
        { status: 400 },
      );
    }
    const fileError = validateShareholderImportFile(file);
    if (fileError) {
      return NextResponse.json({ error: fileError }, {
        status: file.size > SHAREHOLDER_IMPORT_MAX_BYTES ? 413 : 400,
      });
    }

    const { shareholders, rowsById } = parseShareholderWorkbook(
      Buffer.from(await file.arrayBuffer()),
      file.name,
    );
    // Commit every row together. A concurrent ID conflict rolls back the batch.
    const inserted = await prisma.$transaction(async (transaction) => {
      const existing = await transaction.shareholder.findMany({
        select: { id: true },
        where: { id: { in: shareholders.map((shareholder) => shareholder.id) } },
      });
      if (existing.length) {
        throw new ShareholderImportError(
          "Some shareholder IDs already exist. Remove those rows or use different IDs. No shareholders were imported.",
          existing.slice(0, SHAREHOLDER_IMPORT_MAX_ISSUES).map((shareholder) => ({
            row: rowsById.get(shareholderIdKey(shareholder.id)) ?? 0,
            column: "Id",
            message: `Shareholder ID "${shareholder.id}" already exists.`,
          })),
          existing.length,
          409,
        );
      }
      return transaction.shareholder.createMany({ data: shareholders });
    }, { timeout: 30_000 });

    return NextResponse.json({ ok: true, count: inserted.count }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ShareholderImportError) {
      return NextResponse.json({
        error: error.message,
        issues: error.issues,
        issueCount: error.issueCount,
      }, { status: error.status });
    }
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({
        error: "One or more IDs conflict with the registry. No shareholders were imported. Check the IDs and try again.",
      }, { status: 409 });
    }
    console.error("Shareholder import failed", error);
    return NextResponse.json({
      error: "The import could not be completed. No shareholders were imported. Please try again.",
    }, { status: 500 });
  }
}

export const POST = withPermission("shareholders.import", handlePOST);
