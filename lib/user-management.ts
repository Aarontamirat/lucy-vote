import { z } from "zod";
import { EmailSchema, PasswordSchema, OverridesSchema, MeetingIdsSchema } from "@/lib/auth-validation";

export const UserFields = z.object({
  name: z.string().trim().min(1).max(191), email: EmailSchema,
  roleId: z.string().min(1).max(191), active: z.boolean(),
  accessScope: z.enum(["ASSIGNED", "ALL"]),
  overrides: OverridesSchema, meetingIds: MeetingIdsSchema,
}).strict();
export const CreateUserSchema = UserFields.extend({ password: PasswordSchema.optional() });
export const UpdateUserSchema = UserFields;

export const USER_SELECT = {
  id: true, email: true, name: true, active: true, mustChangePassword: true,
  roleId: true, accessScope: true, createdAt: true, updatedAt: true,
  role: { select: { id: true, name: true } },
  overrides: { select: { permission: true, effect: true } },
  meetingAssignments: { select: { meetingId: true } },
} as const;
