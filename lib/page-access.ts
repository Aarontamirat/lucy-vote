import { redirect } from "next/navigation";
import { can, canAccessMeeting, currentUser } from "@/lib/auth";
import type { Permission } from "@/lib/permissions";

export async function requirePageAccess(requirement: Permission | Permission[] | "super-admin", meetingId?: string) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/account/password");
  const permitted = requirement === "super-admin" ? user.superAdmin
    : Array.isArray(requirement) ? requirement.some((permission) => can(user, permission)) : can(user, requirement);
  if (!permitted || (meetingId && !canAccessMeeting(user, meetingId))) redirect("/access-denied");
  return user;
}
