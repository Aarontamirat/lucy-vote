import definitions from "../config/default-roles.json";
import type { Permission } from "@/lib/permissions";

export const DEFAULT_ROLES = definitions as { id: string; name: string; description: string; permissions: Permission[] }[];
