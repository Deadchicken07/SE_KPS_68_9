"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  canRoleAccessPath,
  mapRoleIdToRole,
  roleHome,
} from "@/types/role.types";

export default function StaffRouteGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { me, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    const role = mapRoleIdToRole(me?.role_id ?? null);

    if (!role) {
      router.replace("/login");
      return;
    }

    if (!canRoleAccessPath(role, pathname)) {
      router.replace(roleHome[role]);
    }
  }, [loading, me?.role_id, pathname, router]);

  return null;
}
