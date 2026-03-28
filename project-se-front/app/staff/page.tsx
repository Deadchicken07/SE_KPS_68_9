"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { mapRoleIdToRole, roleHome } from "@/types/role.types";

export default function StaffPage() {
  redirect("/staff/admin/admin-home");
}
