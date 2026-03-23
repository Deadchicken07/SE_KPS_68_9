"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { mapRoleIdToRole, roleHome } from "@/types/role.types";

export default function StaffPage() {
  const router = useRouter();
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

    router.replace(roleHome[role]);
  }, [loading, me?.role_id, router]);

  return (
    <main className="staff-shell flex min-h-screen items-center justify-center text-slate-500">
      Loading staff workspace...
    </main>
  );
}
