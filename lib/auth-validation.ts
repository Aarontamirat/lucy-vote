import { z } from "zod";
import { validPassword } from "@/lib/password";
import { isPermission, isReservedPermission } from "@/lib/permissions";

export const EmailSchema = z.string().trim().toLowerCase().email().max(191);
export const PasswordSchema = z.string().refine(validPassword, "Use a password between 12 and 128 characters.");
export const PermissionSchema = z.string().refine(isPermission, "Unknown permission.");
export const OverrideSchema = z.object({ permission: PermissionSchema, effect: z.enum(["GRANT", "DENY"]) }).strict().refine(
  (entry) => entry.effect !== "GRANT" || !isReservedPermission(entry.permission),
  "This permission is reserved for Super Admin.",
);
export const OverridesSchema = z.array(OverrideSchema).max(100).refine(
  (entries) => new Set(entries.map((item) => item.permission)).size === entries.length, "Each permission can only have one override.",
);
export const MeetingIdsSchema = z.array(z.string().min(1).max(191)).max(1000).refine(
  (ids) => new Set(ids).size === ids.length, "Meeting assignments cannot be repeated.",
);
