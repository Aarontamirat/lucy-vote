import { requirePageAccess } from "@/lib/page-access";

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  await requirePageAccess(["reports.attendance", "reports.voting"], (await params).id);
  return children;
}
