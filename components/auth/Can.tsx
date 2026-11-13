"use client";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Permission } from "@/lib/permissions";
export function Can({ permission, children }: { permission: Permission | Permission[]; children: React.ReactNode }) {
  const { can } = useAuth();
  return (Array.isArray(permission) ? permission.some(can) : can(permission)) ? children : null;
}
