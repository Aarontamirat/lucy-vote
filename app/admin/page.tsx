"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  PERMISSIONS,
  SUPER_ADMIN_ROLE_ID,
  isReservedPermission,
  type Permission,
} from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace/PageHeader";
import {
  EmptyState,
  ErrorNotice,
  LoadingState,
} from "@/components/workspace/Feedback";
import { ConfirmDialog } from "@/components/workspace/ConfirmDialog";
import { formatDate } from "@/lib/display";
import { copyText } from "@/lib/clipboard";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: { permission: string }[];
  _count: { users: number };
};
type ManagedUser = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  role: { name: string };
  active: boolean;
  mustChangePassword: boolean;
  accessScope: "ASSIGNED" | "ALL";
  overrides: { permission: string; effect: "GRANT" | "DENY" }[];
  meetingAssignments: { meetingId: string }[];
};
type UserDraft = {
  id?: string;
  name: string;
  email: string;
  roleId: string;
  active: boolean;
  accessScope: "ASSIGNED" | "ALL";
  overrides: ManagedUser["overrides"];
  meetingIds: string[];
};
type RoleDraft = {
  id?: string;
  name: string;
  description: string;
  permissions: string[];
};
type Meeting = { id: string; title: string; date: string; status: string };
const emptyUser = (): UserDraft => ({
  name: "",
  email: "",
  roleId: "",
  active: true,
  accessScope: "ASSIGNED",
  overrides: [],
  meetingIds: [],
});
const emptyRole = (): RoleDraft => ({
  name: "",
  description: "",
  permissions: [],
});
const groups = [...new Set(PERMISSIONS.map((item) => item.group))];

class ReauthRequired extends Error {}
async function api(url: string, method = "GET", body?: unknown) {
  const response = await fetch(url, {
    method,
    cache: "no-store",
    ...(body === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
  });
  const data = await response.json();
  if (data.code === "REAUTH_REQUIRED") throw new ReauthRequired(data.error);
  if (response.status === 401) window.location.assign("/login");
  if (!response.ok) throw new Error(data.error || "The request failed.");
  return data;
}

export default function AdminPage() {
  const { user: actor, refresh } = useAuth();
  const loadVersion = useRef(0);
  const [loading, setLoading] = useState(true);
  const [pendingChange, setPendingChange] = useState<{
    title: string;
    description: string;
    label: string;
    operation: () => Promise<void>;
  } | null>(null);
  const [tab, setTab] = useState<"users" | "roles">("users");
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [userDraft, setUserDraft] = useState<UserDraft | null>(null);
  const [roleDraft, setRoleDraft] = useState<RoleDraft | null>(null);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const passwordInput = useRef<HTMLInputElement>(null);
  const copyVersion = useRef(0);
  const copyPending = useRef(false);
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copying" | "copied" | "failed" | "manual"
  >("idle");
  const [reauthOperation, setReauthOperation] = useState<
    (() => Promise<void>) | null
  >(null);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function showCredentials(email: string, password: string) {
    ++copyVersion.current;
    copyPending.current = false;
    setCredentials({ email, password });
    setShowPassword(false);
    setCopyStatus("idle");
  }

  function closeCredentials() {
    ++copyVersion.current;
    copyPending.current = false;
    setCredentials(null);
    setShowPassword(false);
    setCopyStatus("idle");
  }

  async function copyPassword() {
    if (!credentials || copyPending.current) return;
    copyPending.current = true;
    const version = ++copyVersion.current;
    setCopyStatus("copying");
    let copied = false;
    try {
      copied = await copyText(
        credentials.password,
        passwordInput.current?.closest<HTMLElement>('[role="dialog"]'),
      );
    } catch {
      // Offer manual selection if an unexpected browser clipboard failure occurs.
    } finally {
      if (version === copyVersion.current) {
        copyPending.current = false;
        setCopyStatus(copied ? "copied" : "failed");
      }
    }
  }

  useEffect(() => {
    if (copyStatus === "manual" && showPassword) {
      passwordInput.current?.focus();
      passwordInput.current?.select();
    }
  }, [copyStatus, showPassword]);

  async function load() {
    const version = ++loadVersion.current;
    setLoading(true);
    setError("");
    try {
      const [userData, roleData, meetingData] = await Promise.all([
        api(`/api/admin/users?page=${page}&q=${encodeURIComponent(query)}`),
        api("/api/admin/roles"),
        api("/api/admin/meetings"),
      ]);
      if (version !== loadVersion.current) return;
      setUsers(userData.users);
      setTotal(userData.total);
      setRoles(roleData.roles);
      setMeetings(meetingData.meetings);
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }
  useEffect(() => {
    let active = true;
    const versionRef = loadVersion;
    const timer = setTimeout(() => {
      load().catch((error) => {
        if (active) setError(error.message);
      });
    }, 200);
    return () => {
      active = false;
      ++versionRef.current;
      clearTimeout(timer);
    };
    // Page and search changes reload the lists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query]);

  async function mutate(operation: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await operation();
      await load();
      await refresh();
    } catch (error) {
      if (error instanceof ReauthRequired) {
        setReauthOperation(() => operation);
        setReauthPassword("");
        setReauthError("");
      } else
        setError(
          error instanceof Error ? error.message : "The request failed.",
        );
    } finally {
      setBusy(false);
    }
  }
  function selectUser(user: ManagedUser) {
    setUserDraft({
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      active: user.active,
      accessScope: user.accessScope,
      overrides: [...user.overrides],
      meetingIds: user.meetingAssignments.map((item) => item.meetingId),
    });
  }
  function override(permission: Permission, effect: string) {
    if (!userDraft) return;
    setUserDraft({
      ...userDraft,
      overrides: [
        ...userDraft.overrides.filter((item) => item.permission !== permission),
        ...(effect === "INHERIT"
          ? []
          : [{ permission, effect: effect as "GRANT" | "DENY" }]),
      ],
    });
  }
  const chosenRole = roles.find((role) => role.id === userDraft?.roleId);
  const adminDraft = userDraft?.roleId === SUPER_ADMIN_ROLE_ID;
  const fixedRole = roleDraft?.id === SUPER_ADMIN_ROLE_ID;
  return (
    <main className="work-page">
      <PageHeader
        eyebrow="TEAM & ACCESS"
        title="Users & Roles"
        description="Give each team member the right tools and access to the right meetings."
      />
      <div className="settings-tabs">
        <Button
          variant={tab === "users" ? "default" : "outline"}
          onClick={() => setTab("users")}
        >
          Users
        </Button>
        <Button
          variant={tab === "roles" ? "default" : "outline"}
          onClick={() => setTab("roles")}
        >
          Roles & permissions
        </Button>
      </div>
      {error && <ErrorNotice message={error} />}
      {notice && (
        <p role="status" className="settings-notice">
          {notice}
        </p>
      )}
      <div className="settings-grid">
        <section className="panel settings-list">
          {tab === "users" ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Accounts ({total})</h2>
                <Button size="sm" onClick={() => setUserDraft(emptyUser())}>
                  Add user
                </Button>
              </div>
              <label className="block text-sm">
                Search accounts
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Name or email"
                />
              </label>
              <div className="space-y-2">
                {loading && !users.length && (
                  <LoadingState label="Loading accounts…" />
                )}
                {!loading && !users.length && (
                  <EmptyState
                    title="No accounts found"
                    description="Try another name or email."
                  />
                )}
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className={`settings-item ${userDraft?.id === user.id ? "is-selected" : ""}`}
                  >
                    <span className="block font-semibold">{user.name}</span>
                    <span className="block truncate text-sm">{user.email}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.role.name} · {user.active ? "Active" : "Disabled"}
                      {user.mustChangePassword && " · Password change required"}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-xs">Page {page}</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page * 50 >= total}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Roles</h2>
                <Button size="sm" onClick={() => setRoleDraft(emptyRole())}>
                  Add role
                </Button>
              </div>
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() =>
                    setRoleDraft({
                      id: role.id,
                      name: role.name,
                      description: role.description,
                      permissions: role.permissions.map(
                        (item) => item.permission,
                      ),
                    })
                  }
                  className={`settings-item ${roleDraft?.id === role.id ? "is-selected" : ""}`}
                >
                  <span className="block font-semibold">{role.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {role._count.users} users · {role.permissions.length}{" "}
                    permissions
                  </span>
                </button>
              ))}
            </>
          )}
        </section>
        <section className="panel settings-editor">
          {tab === "users" &&
            (userDraft ? (
              <form
                className="space-y-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  void mutate(async () => {
                    const { id, ...body } = userDraft;
                    const result = await api(
                      id ? `/api/admin/users/${id}` : "/api/admin/users",
                      id ? "PUT" : "POST",
                      { ...body, accessScope: adminDraft ? "ALL" : "ASSIGNED" },
                    );
                    if (result.temporaryPassword) {
                      showCredentials(body.email, result.temporaryPassword);
                    }
                    setUserDraft(null);
                    setNotice(id ? "User access updated." : "User created.");
                  });
                }}
              >
                <h2 className="text-xl font-semibold">
                  {userDraft.id ? "Edit user" : "Create user"}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm">
                    Display name
                    <Input
                      required
                      maxLength={191}
                      value={userDraft.name}
                      onChange={(event) =>
                        setUserDraft({ ...userDraft, name: event.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Email
                    <Input
                      type="email"
                      required
                      maxLength={191}
                      value={userDraft.email}
                      onChange={(event) =>
                        setUserDraft({
                          ...userDraft,
                          email: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <label className="block text-sm">
                  Role
                  <select
                    aria-label="Role"
                    required
                    className="mt-1 w-full rounded-md border bg-transparent p-2"
                    value={userDraft.roleId}
                    onChange={(event) =>
                      setUserDraft({
                        ...userDraft,
                        roleId: event.target.value,
                        ...(event.target.value === SUPER_ADMIN_ROLE_ID
                          ? { overrides: [] }
                          : {}),
                      })
                    }
                  >
                    <option value="">Choose a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={userDraft.active}
                    onChange={(event) =>
                      setUserDraft({
                        ...userDraft,
                        active: event.target.checked,
                      })
                    }
                  />
                  Account active
                </label>
                {adminDraft ? (
                  <p className="rounded-lg bg-cyan-50 p-3 text-sm dark:bg-cyan-950">
                    Super Admins can manage all meetings, users, roles, and
                    permissions.
                  </p>
                ) : (
                  <>
                    <fieldset>
                      <legend className="font-semibold">
                        Assigned meetings
                      </legend>
                      <p className="my-2 text-xs text-muted-foreground">
                        This user can access only these meetings. Registry
                        permissions apply to the shared registry.
                      </p>
                      <div className="max-h-52 space-y-2 overflow-auto rounded-lg border p-3">
                        {meetings.length ? (
                          meetings.map((meeting) => (
                            <label
                              key={meeting.id}
                              className="flex items-start gap-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={userDraft.meetingIds.includes(
                                  meeting.id,
                                )}
                                onChange={(event) =>
                                  setUserDraft({
                                    ...userDraft,
                                    meetingIds: event.target.checked
                                      ? [...userDraft.meetingIds, meeting.id]
                                      : userDraft.meetingIds.filter(
                                          (id) => id !== meeting.id,
                                        ),
                                  })
                                }
                              />
                              <span>
                                {meeting.title}
                                <span className="block text-xs text-muted-foreground">
                                  {formatDate(meeting.date)} · {meeting.status}
                                </span>
                              </span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm">No meetings yet.</p>
                        )}
                      </div>
                    </fieldset>
                    <details className="permissions-details">
                      <summary>
                        Individual permission overrides (
                        {userDraft.overrides.length})
                      </summary>
                      <p className="my-2 text-xs text-muted-foreground">
                        Inherit uses the role setting. Grant allows the action
                        for this user. Revoke removes it even when the role
                        allows it.
                      </p>
                      {groups.map((group) => (
                        <fieldset
                          key={group}
                          className="mb-4 rounded-lg border p-3"
                        >
                          <legend className="px-1 text-sm font-semibold">
                            {group}
                          </legend>
                          {PERMISSIONS.filter(
                            (item) => item.group === group,
                          ).map((item) => {
                            if (isReservedPermission(item.key))
                              return (
                                <p
                                  key={item.key}
                                  className="border-b py-2 text-sm last:border-0"
                                >
                                  {item.label}
                                  <span className="block text-xs text-muted-foreground">
                                    Reserved for Super Admin
                                  </span>
                                </p>
                              );
                            const roleAllows = !!chosenRole?.permissions.some(
                              (entry) => entry.permission === item.key,
                            );
                            const value =
                              userDraft.overrides.find(
                                (entry) => entry.permission === item.key,
                              )?.effect ?? "INHERIT";
                            return (
                              <label
                                key={item.key}
                                className="flex items-center justify-between gap-3 border-b py-2 text-sm last:border-0"
                              >
                                <span>
                                  {item.label}
                                  <span className="block text-xs text-muted-foreground">
                                    Role: {roleAllows ? "allowed" : "denied"}
                                  </span>
                                </span>
                                <select
                                  className="rounded border bg-transparent p-1"
                                  value={value}
                                  onChange={(event) =>
                                    override(item.key, event.target.value)
                                  }
                                >
                                  <option value="INHERIT">Inherit</option>
                                  <option value="GRANT">Grant</option>
                                  <option value="DENY">Revoke</option>
                                </select>
                              </label>
                            );
                          })}
                        </fieldset>
                      ))}
                    </details>
                  </>
                )}
                <div className="save-actions">
                  <Button disabled={busy}>
                    {busy ? "Saving…" : "Save user"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUserDraft(null)}
                  >
                    Cancel
                  </Button>
                  {userDraft.id && userDraft.id !== actor?.id && (
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => {
                        setPendingChange({
                          title: "Reset password",
                          description: `Reset the password for ${userDraft.email}? Their sessions will be signed out and a new temporary password will be generated.`,
                          label: "Reset password",
                          operation: async () => {
                            const result = await api(
                              `/api/admin/users/${userDraft.id}/password`,
                              "POST",
                            );
                            showCredentials(
                              userDraft.email,
                              result.temporaryPassword,
                            );
                            setNotice(
                              "Password reset. A new password is required at sign-in.",
                            );
                          },
                        });
                      }}
                    >
                      Reset password
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              <EmptyState
                title="Choose an account to get started"
                description="Select a team member to review their role, assigned meetings and permissions, or add someone new."
              />
            ))}
          {tab === "roles" &&
            (roleDraft ? (
              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  void mutate(async () => {
                    const { id, ...body } = roleDraft;
                    await api(
                      id ? `/api/admin/roles/${id}` : "/api/admin/roles",
                      id ? "PUT" : "POST",
                      body,
                    );
                    setRoleDraft(null);
                    setNotice(
                      "Role permissions saved. Users inherit the updated permissions immediately.",
                    );
                  });
                }}
              >
                <h2 className="text-xl font-semibold">
                  {roleDraft.id ? "Edit role" : "Create role"}
                </h2>
                {fixedRole && (
                  <p className="text-sm text-muted-foreground">
                    The built-in Super Admin role has all permissions and cannot
                    be changed or deleted.
                  </p>
                )}
                <label className="block text-sm">
                  Role name
                  <Input
                    required
                    maxLength={191}
                    value={roleDraft.name}
                    disabled={fixedRole}
                    onChange={(event) =>
                      setRoleDraft({ ...roleDraft, name: event.target.value })
                    }
                  />
                </label>
                <label className="block text-sm">
                  Description
                  <Input
                    maxLength={500}
                    value={roleDraft.description}
                    disabled={fixedRole}
                    onChange={(event) =>
                      setRoleDraft({
                        ...roleDraft,
                        description: event.target.value,
                      })
                    }
                  />
                </label>
                {groups.map((group) => (
                  <fieldset key={group} className="rounded-lg border p-3">
                    <legend className="px-1 text-sm font-semibold">
                      {group}
                    </legend>
                    {PERMISSIONS.filter(
                      (item) =>
                        item.group === group &&
                        (fixedRole || !isReservedPermission(item.key)),
                    ).map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2 py-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={roleDraft.permissions.includes(item.key)}
                          disabled={fixedRole}
                          onChange={(event) =>
                            setRoleDraft({
                              ...roleDraft,
                              permissions: event.target.checked
                                ? [...roleDraft.permissions, item.key]
                                : roleDraft.permissions.filter(
                                    (key) => key !== item.key,
                                  ),
                            })
                          }
                        />
                        {item.label}
                      </label>
                    ))}
                  </fieldset>
                ))}
                {!fixedRole && (
                  <div className="flex gap-3">
                    <Button disabled={busy}>Save role</Button>
                    {roleDraft.id && (
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={busy}
                        onClick={() => {
                          setPendingChange({
                            title: "Delete role",
                            description: `Delete ${roleDraft.name}? Roles assigned to an account must be reassigned before they can be deleted.`,
                            label: "Delete role",
                            operation: async () => {
                              await api(
                                `/api/admin/roles/${roleDraft.id}`,
                                "DELETE",
                              );
                              setRoleDraft(null);
                              setNotice("Role deleted.");
                            },
                          });
                        }}
                      >
                        Delete role
                      </Button>
                    )}
                  </div>
                )}
              </form>
            ) : (
              <EmptyState
                title="The right tools for each role"
                description="Select a role to review its permissions, or create a new role for your team."
              />
            ))}
        </section>
      </div>
      <ConfirmDialog
        open={!!pendingChange}
        title={pendingChange?.title ?? "Confirm change"}
        description={pendingChange?.description ?? ""}
        label={pendingChange?.label}
        destructive
        busy={busy}
        onClose={() => setPendingChange(null)}
        onConfirm={() => {
          const operation = pendingChange?.operation;
          setPendingChange(null);
          if (operation) void mutate(operation);
        }}
      />
      <Dialog
        open={!!reauthOperation}
        onOpenChange={(open) => {
          if (!open) {
            setReauthOperation(null);
            setReauthPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your password</DialogTitle>
            <DialogDescription>
              Confirm your identity before changing account access.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              setBusy(true);
              setReauthError("");
              void api("/api/auth/reauth", "POST", { password: reauthPassword })
                .then(async () => {
                  const operation = reauthOperation;
                  setReauthOperation(null);
                  setReauthPassword("");
                  if (operation) await mutate(operation);
                })
                .catch((error) => setReauthError(error.message))
                .finally(() => setBusy(false));
            }}
          >
            <Input
              aria-label="Current password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
              value={reauthPassword}
              onChange={(event) => setReauthPassword(event.target.value)}
              disabled={busy}
            />
            {reauthError && (
              <p role="alert" className="text-sm text-red-600">
                {reauthError}
              </p>
            )}
            <Button disabled={busy}>Confirm password</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!credentials}
        onOpenChange={(open) => {
          if (!open) closeCredentials();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporary sign-in details</DialogTitle>
            <DialogDescription>
              Share this password privately. The user must replace it at first
              sign-in.
            </DialogDescription>
          </DialogHeader>
          {credentials && (
            <div className="space-y-3">
              <p className="font-semibold">{credentials.email}</p>
              <Input
                ref={passwordInput}
                aria-label="Temporary password"
                aria-describedby={
                  copyStatus !== "idle"
                    ? "temporary-password-copy-feedback"
                    : undefined
                }
                autoComplete="off"
                readOnly
                type={showPassword ? "text" : "password"}
                value={credentials.password}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  aria-disabled={copyStatus === "copying"}
                  aria-busy={copyStatus === "copying"}
                  className={copyStatus === "copying" ? "opacity-50" : undefined}
                  onClick={() => void copyPassword()}
                >
                  {copyStatus === "copying" ? "Copying…" : "Copy password"}
                </Button>
                {copyStatus === "failed" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPassword(true);
                      setCopyStatus("manual");
                    }}
                  >
                    Select password
                  </Button>
                )}
                <Button type="button" onClick={closeCredentials}>
                  Done
                </Button>
              </div>
              {copyStatus !== "idle" && (
                <p
                  id="temporary-password-copy-feedback"
                  role={copyStatus === "failed" ? "alert" : "status"}
                  className={`text-sm ${
                    copyStatus === "failed"
                      ? "text-red-700 dark:text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {copyStatus === "copying" && "Copying the temporary password…"}
                  {copyStatus === "copied" && "Temporary password copied."}
                  {copyStatus === "failed" &&
                    "Your browser could not copy the password. Use Select password, then copy it manually."}
                  {copyStatus === "manual" &&
                    "Password selected. Press Ctrl+C (Command+C on Mac), or use your device’s Copy action."}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
