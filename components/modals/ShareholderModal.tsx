"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ErrorNotice } from "@/components/workspace/Feedback";
import { responseError } from "@/lib/response-error";
import { Download } from "lucide-react";
import {
  SHAREHOLDER_IMPORT_MAX_ROWS,
  SHAREHOLDER_TEMPLATE_FILENAME,
  validateShareholderImportFile,
  type ShareholderImportIssue,
} from "@/lib/shareholder-import-config";

type ShareholderFormData = {
  id: string;
  name: string;
  nameAm: string | null;
  phone?: string | null;
  address?: string | null;
  shareValue: string;
};

type ImportFeedback = {
  message: string;
  issues: ShareholderImportIssue[];
  issueCount: number;
};

interface ShareholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "bulk";
  initialData?: ShareholderFormData | null;
  onSuccess: () => void;
}

export default function ShareholderModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSuccess,
}: ShareholderModalProps) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shareValue, setShareValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(
    null,
  );

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setId(initialData.id);
      setName(initialData.name);
      setNameAm(initialData.nameAm || "");
      setPhone(initialData.phone || "");
      setAddress(initialData.address || "");
      setShareValue(initialData.shareValue);
    } else {
      setId("");
      setName("");
      setNameAm("");
      setPhone("");
      setAddress("");
      setShareValue("");
    }
    setSaveError("");
    setFile(null);
    setImportFeedback(null);
  }, [mode, initialData, isOpen]);

  const handleSubmit = async () => {
    if (loading) return;
    setSaveError("");
    if (mode === "bulk") {
      if (!file) {
        setImportFeedback({
          message: "Select an Excel file to import.",
          issues: [],
          issueCount: 0,
        });
        return;
      }
      const fileError = validateShareholderImportFile(file);
      if (fileError) {
        setImportFeedback({ message: fileError, issues: [], issueCount: 0 });
        return;
      }
      setLoading(true);
      setImportFeedback(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/shareholders/bulk", {
          method: "POST",
          body: formData,
        });
        const data: {
          count: number;
          error?: string;
          issues?: ShareholderImportIssue[];
          issueCount?: number;
        } = await res.json();
        if (res.ok) {
          toast.success(
            `Imported ${data.count.toLocaleString()} shareholders successfully`,
          );
          onSuccess();
          onClose();
        } else {
          setImportFeedback({
            message:
              data.error || "The import could not be completed. Try again.",
            issues: data.issues || [],
            issueCount: data.issueCount || 0,
          });
        }
      } catch {
        setImportFeedback({
          message:
            "Unable to complete the import. Check your connection and try again.",
          issues: [],
          issueCount: 0,
        });
      } finally {
        setLoading(false);
      }
      return;
    } else {
      if (!id.trim() && mode === "add") {
        setSaveError("ID is required");
        return;
      }
      if (!name.trim()) {
        setSaveError("Name is required");
        return;
      }
      if (!nameAm.trim() && (mode === "add" || initialData?.nameAm)) {
        setSaveError("Amharic Name is required");
        return;
      }
      if (!shareValue.trim() || isNaN(Number(shareValue))) {
        setSaveError("Valid Share Value is required");
        return;
      }

      setLoading(true);
      try {
        const url =
          mode === "add"
            ? "/api/shareholders"
            : `/api/shareholders/${encodeURIComponent(id)}`;
        const method = mode === "add" ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            name,
            ...(nameAm.trim() ? { nameAm } : {}),
            phone,
            address,
            shareValue,
          }),
        });

        const data = await res.json();
        if (!res.ok)
          throw new Error(
            responseError(data.error, "The shareholder could not be saved."),
          );

        toast.success(
          `Shareholder ${mode === "add" ? "added" : "updated"} successfully!`,
        );
        onClose();
        onSuccess();
      } catch (err: unknown) {
        setSaveError(
          err instanceof Error
            ? err.message
            : "The shareholder could not be saved.",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !loading) onClose();
      }}
    >
      <DialogContent showCloseButton={!loading} className="">
        <DialogHeader>
          <DialogTitle>
            {mode === "add"
              ? "Add New Shareholder"
              : mode === "bulk"
                ? "Mass Import Shareholders"
                : "Edit Shareholder"}
          </DialogTitle>
          <DialogDescription>
            {mode === "bulk"
              ? "Download the template, fill in your shareholders, then upload the completed workbook."
              : "Enter the shareholder's details below."}
          </DialogDescription>
        </DialogHeader>

        {saveError && <ErrorNotice message={saveError} />}
        <form
          id="shareholder-form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          {/* CONTENT */}
          {mode === "bulk" ? (
            <div className="space-y-4 mt-3">
              <Button asChild variant="outline">
                <a
                  href="/api/shareholders/template"
                  download={SHAREHOLDER_TEMPLATE_FILENAME}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download Excel template
                </a>
              </Button>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <p>Required: Id, Name, Share Value.</p>
                <p>
                  Name Am, Phone, and Address are optional. Keep IDs, phone
                  numbers, and share values formatted as text.
                </p>
                <p>
                  Up to 5 MB and {SHAREHOLDER_IMPORT_MAX_ROWS.toLocaleString()}{" "}
                  rows. If any row has an error, no shareholders are imported.
                </p>
              </div>
              <div>
                <Label
                  htmlFor="bulkImport"
                  className="block text-sm font-medium mb-1"
                >
                  Excel File
                </Label>
                <Input
                  id="bulkImport"
                  type="file"
                  accept=".xlsx, .xls"
                  disabled={loading}
                  aria-describedby="import-file-help"
                  onChange={(e) => {
                    const selected = e.target.files?.[0] || null;
                    const error = selected
                      ? validateShareholderImportFile(selected)
                      : null;
                    setFile(error ? null : selected);
                    setImportFeedback(
                      error
                        ? { message: error, issues: [], issueCount: 0 }
                        : null,
                    );
                    if (error) e.target.value = "";
                  }}
                  className=""
                />
                <p
                  id="import-file-help"
                  className="mt-1 text-xs text-gray-600 dark:text-gray-300"
                >
                  Excel workbooks (.xlsx or .xls). Enter data on the
                  Shareholders worksheet.
                </p>
              </div>
              {importFeedback && (
                <div
                  role="alert"
                  className="space-y-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
                >
                  <p>{importFeedback.message}</p>
                  {importFeedback.issues.length > 0 && (
                    <ul className="max-h-44 list-disc space-y-1 overflow-y-auto pl-5">
                      {importFeedback.issues.map((issue, index) => (
                        <li key={`${issue.row}-${issue.column}-${index}`}>
                          {issue.row > 0 ? `Row ${issue.row}` : "File"},{" "}
                          {issue.column}: {issue.message}
                        </li>
                      ))}
                    </ul>
                  )}
                  {importFeedback.issueCount > importFeedback.issues.length && (
                    <p>
                      Showing the first {importFeedback.issues.length} of{" "}
                      {importFeedback.issueCount} issues.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 mt-3">
              {/* ID (Add Only) */}
              {mode === "add" && (
                <div>
                  <label
                    htmlFor="shareholder-id"
                    className="block text-sm font-medium mb-1"
                  >
                    ID
                  </label>
                  <Input
                    id="shareholder-id"
                    disabled={loading}
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className=""
                  />
                </div>
              )}

              {/* NAME */}
              <div>
                <label
                  htmlFor="shareholder-name"
                  className="block text-sm font-medium mb-1"
                >
                  Name
                </label>
                <Input
                  id="shareholder-name"
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className=""
                />
              </div>

              {/* AMHARIC NAME */}
              <div>
                <label
                  htmlFor="shareholder-nameAm"
                  className="block text-sm font-medium mb-1"
                >
                  Amharic Name
                </label>
                <Input
                  id="shareholder-nameAm"
                  disabled={loading}
                  value={nameAm}
                  onChange={(e) => setNameAm(e.target.value)}
                  className=""
                />
              </div>

              {/* PHONE */}
              <div>
                <label
                  htmlFor="shareholder-phone"
                  className="block text-sm font-medium mb-1"
                >
                  Phone
                </label>
                <Input
                  id="shareholder-phone"
                  disabled={loading}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className=""
                />
              </div>

              {/* ADDRESS */}
              <div>
                <label
                  htmlFor="shareholder-address"
                  className="block text-sm font-medium mb-1"
                >
                  Address
                </label>
                <Input
                  id="shareholder-address"
                  disabled={loading}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className=""
                />
              </div>

              {/* SHARE VALUE */}
              <div>
                <label
                  htmlFor="shareholder-shareValue"
                  className="block text-sm font-medium mb-1"
                >
                  Share Value
                </label>
                <Input
                  id="shareholder-shareValue"
                  disabled={loading}
                  value={shareValue}
                  onChange={(e) => setShareValue(e.target.value)}
                  className=""
                />
              </div>
            </div>
          )}
        </form>
        {/* FOOTER */}
        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            className=""
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="shareholder-form"
            disabled={loading || (mode === "bulk" && !file)}
            className=""
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4 text-cyan-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}

            {mode === "bulk"
              ? loading
                ? "Importing..."
                : "Import shareholders"
              : loading
                ? "Saving..."
                : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
