import { requirePageAccess } from "@/lib/page-access";
import MeetingsUI from "./MeetingsUI";

export default async function Page() {
  await requirePageAccess("meetings.view");
  return <MeetingsUI />;
}
