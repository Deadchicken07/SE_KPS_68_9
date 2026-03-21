"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mapRoleIdToRole, roleHome, roleLinks, type Roles } from "@/types/role.types";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SidebarNav() {
  const pathname = usePathname();
  const { me } = useAuth();
  const role: Roles | null = useMemo(
    () => mapRoleIdToRole(me?.role_id ?? null),
    [me?.role_id],
  );

  const links = role ? roleLinks[role] : [];
  const homePath = role ? roleHome[role] : "/login";

  return (
    <aside className="min-h-screen w-60 bg-[#0f766e] p-6 text-white">
      <Link href={homePath} className="mb-6 block text-xl font-bold">
        Staff Panel
      </Link>

      <div className="flex flex-col gap-4">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded p-2 ${
                isActive
                  ? "bg-[#065f46] text-white"
                  : "text-[#d1fae5] hover:bg-[#065f46] hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
