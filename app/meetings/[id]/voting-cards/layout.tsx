import { requirePageAccess } from "@/lib/page-access";

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  await requirePageAccess("cards.print", (await params).id);
  return children;
}
