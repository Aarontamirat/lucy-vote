"use client";
import { useEffect, useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ShareholderModal from "@/components/modals/ShareholderModal";
import ShareholderDeleteModal from "@/components/modals/ShareholderDeleteModal";
import ShareholderDeleteAllModal from "@/components/modals/ShareholderDeleteAllModal";
import { PageHeader } from "@/components/workspace/PageHeader";
import {
  EmptyState,
  ErrorNotice,
  LoadingState,
} from "@/components/workspace/Feedback";
import { Pagination } from "@/components/workspace/Pagination";
import { useResource } from "@/components/workspace/useResource";
import { formatNumber } from "@/lib/display";

type Shareholder = {
  id: string;
  name: string;
  nameAm: string | null;
  phone: string | null;
  address: string | null;
  shareValue: string;
};
type Registry = { items: Shareholder[]; total: number; totalShares: string };
export default function ShareholdersPage() {
  const { can } = useAuth();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [modal, setModal] = useState<"add" | "edit" | "bulk" | null>(null);
  const [selected, setSelected] = useState<Shareholder | null>(null);
  const [deleting, setDeleting] = useState<Shareholder | null>(null);
  const [deleteAll, setDeleteAll] = useState(false);
  const { data, loading, error, reload } = useResource<Registry>(
    `/api/shareholders?q=${encodeURIComponent(query)}&page=${page}&take=${size}`,
    250,
  );
  useEffect(() => {
    if (data && !loading && page > Math.max(1, Math.ceil(data.total / size)))
      setPage(Math.max(1, Math.ceil(data.total / size)));
  }, [data, loading, page, size]);
  const edit = (holder: Shareholder) => {
    setSelected(holder);
    setModal("edit");
  };
  return (
    <main className="work-page">
      <PageHeader
        eyebrow="SHAREHOLDER REGISTRY"
        title="Shareholders"
        description="Find, organise and maintain the people behind your organisation."
        actions={
          <>
            {can("shareholders.import") && (
              <Button variant="outline" onClick={() => setModal("bulk")}>
                <Upload />
                Import Excel
              </Button>
            )}
            {can("shareholders.create") && (
              <Button
                onClick={() => {
                  setSelected(null);
                  setModal("add");
                }}
              >
                <Plus />
                Add shareholder
              </Button>
            )}
          </>
        }
      />
      <div className="dashboard-banner">
        <Users size={25} />
        <div>
          <h2>
            {data
              ? `${formatNumber(data.total, 0)} ${query ? "matching" : "registered"} shareholders`
              : "Your shareholder registry"}
          </h2>
          <p>
            {data
              ? `${formatNumber(data.totalShares)} total registered share value`
              : "Shareholder details and share values, together in one place."}
          </p>
        </div>
      </div>
      {error && <ErrorNotice message={error} retry={reload} />}
      <section className="panel">
        <div className="toolbar">
          <div className="search-field">
            <Search />
            <Input
              aria-label="Search shareholders"
              placeholder="Search name, ID or phone…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="filter-select"
            aria-label="Records per page"
            value={size}
            onChange={(event) => {
              setSize(Number(event.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <div className="toolbar-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Refresh shareholders"
              disabled={loading}
              onClick={reload}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
            </Button>
            {can("shareholders.deleteAll") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Registry options"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteAll(true)}
                  >
                    <Trash2 />
                    Delete entire registry
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {loading && !data ? (
          <LoadingState label="Loading shareholders…" />
        ) : data?.items.length ? (
          <div aria-busy={loading}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shareholder</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Share value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((holder) => (
                  <TableRow key={holder.id}>
                    <TableCell>
                      <div className="person-cell">
                        <span className="avatar" aria-hidden="true">
                          {holder.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <strong>{holder.name}</strong>
                          {holder.nameAm && (
                            <small lang="am">{holder.nameAm}</small>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {holder.id}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {holder.phone || "—"}
                    </TableCell>
                    <TableCell
                      className="max-w-[220px] truncate text-xs"
                      title={holder.address ?? undefined}
                    >
                      {holder.address || "—"}
                    </TableCell>
                    <TableCell className="text-right numeric">
                      {formatNumber(holder.shareValue, 6)}
                    </TableCell>
                    <TableCell>
                      <div className="row-actions">
                        {can("shareholders.edit") && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${holder.name}`}
                            onClick={() => edit(holder)}
                          >
                            <Pencil />
                          </Button>
                        )}
                        {can("shareholders.delete") && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${holder.name}`}
                            onClick={() => setDeleting(holder)}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          !error && (
            <EmptyState
              title={
                query
                  ? "No matching shareholders"
                  : "Start your shareholder registry"
              }
              description={
                query
                  ? "Try a different name, ID or phone number, or clear the search."
                  : "Add your first shareholder or import your existing records from an Excel file."
              }
              action={
                query ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setPage(1);
                    }}
                  >
                    Clear search
                  </Button>
                ) : (
                  can("shareholders.create") && (
                    <Button onClick={() => setModal("add")}>
                      <Plus />
                      Add shareholder
                    </Button>
                  )
                )
              }
            />
          )
        )}
        <Pagination
          page={page}
          total={data?.total ?? 0}
          size={size}
          loading={loading}
          onPage={setPage}
        />
      </section>
      <ShareholderModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        mode={modal ?? "add"}
        initialData={selected}
        onSuccess={reload}
      />
      <ShareholderDeleteModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        shareholder={deleting}
        onSuccess={reload}
      />
      <ShareholderDeleteAllModal
        isOpen={deleteAll}
        onClose={() => setDeleteAll(false)}
        shareholder={null}
        onSuccess={reload}
      />
    </main>
  );
}
