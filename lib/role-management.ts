import { z } from "zod";
import { PermissionSchema } from "@/lib/auth-validation";
import { isReservedPermission } from "@/lib/permissions";

export const RoleSchema = z.object({
  name: z.string().trim().min(1).max(191).refine((value) => value.toLowerCase() !== "super admin", "The Super Admin role is reserved."),
  description: z.string().trim().max(500),
  permissions: z.array(PermissionSchema).max(100)
    .refine((values) => new Set(values).size === values.length, "Duplicate permissions.")
    .refine((values) => !values.some(isReservedPermission), "Sensitive actions are reserved for Super Admin."),
}).strict();
