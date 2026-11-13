import { requirePageAccess } from "@/lib/page-access";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requirePageAccess("super-admin");
  return children;
}
