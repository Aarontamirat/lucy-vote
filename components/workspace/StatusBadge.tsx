const labels: Record<string, string> = {
  DRAFT: "Draft",
  OPEN: "Attendance open",
  VOTINGOPEN: "Voting open",
  CLOSED: "Closed",
  STARTED: "Started",
  SUCCEEDED: "Succeeded",
  REJECTED: "Rejected",
  FAILED: "Failed",
};
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span aria-hidden="true" />
      {labels[status] ?? status}
    </span>
  );
}
