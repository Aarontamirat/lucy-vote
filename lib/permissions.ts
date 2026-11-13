export const SUPER_ADMIN_ROLE_ID = "super-admin";

export const PERMISSIONS = [
  {
    key: "shareholders.view",
    label: "View shareholder registry",
    group: "Registry",
  },
  {
    key: "shareholders.lookup",
    label: "Look up shareholder IDs, names, and shares for a meeting",
    group: "Registry",
  },
  { key: "shareholders.create", label: "Add shareholders", group: "Registry" },
  {
    key: "shareholders.edit",
    label: "Edit shareholders and share values",
    group: "Registry",
  },
  {
    key: "shareholders.import",
    label: "Import shareholders from Excel",
    group: "Registry",
  },
  {
    key: "shareholders.delete",
    label: "Delete a shareholder",
    group: "Registry",
  },
  {
    key: "shareholders.deleteAll",
    label: "Delete the entire shareholder registry",
    group: "Registry",
  },
  { key: "meetings.view", label: "View meetings", group: "Meetings" },
  { key: "meetings.create", label: "Create meetings", group: "Meetings" },
  {
    key: "meetings.edit",
    label: "Edit meeting configuration",
    group: "Meetings",
  },
  { key: "meetings.delete", label: "Delete draft meetings", group: "Meetings" },
  { key: "meetings.open", label: "Open attendance", group: "Meetings" },
  { key: "meetings.openVoting", label: "Open voting", group: "Meetings" },
  {
    key: "meetings.close",
    label: "Close meetings / voting",
    group: "Meetings",
  },
  { key: "nominees.view", label: "View nominees", group: "Nominees" },
  {
    key: "nominees.manage",
    label: "Add, edit, and remove nominees",
    group: "Nominees",
  },
  {
    key: "attendance.view",
    label: "View attendance records",
    group: "Attendance",
  },
  {
    key: "attendance.register",
    label: "Register attendance and representatives",
    group: "Attendance",
  },
  { key: "attendance.remove", label: "Remove attendance", group: "Attendance" },
  {
    key: "votes.lookup",
    label: "Look up a voter's eligibility and recorded choices",
    group: "Voting",
  },
  { key: "votes.record", label: "Record ballots", group: "Voting" },
  { key: "votes.reverse", label: "Reverse recorded votes", group: "Voting" },
  { key: "cards.print", label: "View and print voting cards", group: "Voting" },
  {
    key: "results.view",
    label: "View aggregate election results",
    group: "Reports",
  },
  {
    key: "reports.attendance",
    label: "View / export attendance reports",
    group: "Reports",
  },
  {
    key: "reports.voting",
    label: "View / export voting reports",
    group: "Reports",
  },
  {
    key: "projection.view",
    label: "View live projection screens",
    group: "Reports",
  },
  { key: "audit.view", label: "View audit history", group: "Security" },
] as const;

export type Permission = (typeof PERMISSIONS)[number]["key"];
// These actions are reserved by the approved access policy, even if stale
// database records contain a role permission or individual grant.
export const RESERVED_PERMISSIONS: readonly Permission[] = [
  "shareholders.delete", "shareholders.deleteAll", "meetings.delete",
  "attendance.remove", "votes.reverse",
];
export const isReservedPermission = (permission: string) =>
  RESERVED_PERMISSIONS.includes(permission as Permission);
export const PERMISSION_KEYS: Permission[] = PERMISSIONS.map(
  (item) => item.key,
);
export const isPermission = (value: string): value is Permission =>
  PERMISSION_KEYS.includes(value as Permission);

// Security administration is a fixed Super Admin capability, never a custom grant.
export function effectivePermissions(user: {
  roleId: string;
  role: { permissions: { permission: string }[] };
  overrides: { permission: string; effect: string }[];
}): Permission[] {
  if (user.roleId === SUPER_ADMIN_ROLE_ID) return [...PERMISSION_KEYS];
  const allowed = new Set(
    user.role.permissions.map((entry) => entry.permission).filter(isPermission),
  );
  for (const entry of user.overrides) {
    if (!isPermission(entry.permission)) continue;
    if (entry.effect === "DENY") allowed.delete(entry.permission);
    else if (entry.effect === "GRANT") allowed.add(entry.permission);
  }
  return [...allowed].filter((permission) => !isReservedPermission(permission));
}
