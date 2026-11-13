import { requirePageAccess } from "@/lib/page-access";
import ShareholdersUI from "./ShareholdersUI";

export default async function Page() {
  await requirePageAccess("shareholders.view");
  return <ShareholdersUI />;
}
