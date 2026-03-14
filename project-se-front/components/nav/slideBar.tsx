"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthMeResponse } from "@/types/auth.types";
import { mapRoleIdToRole, roleHome, roleLinks, type Roles } from "@/types/role.types";

const API_URL = "http://localhost:4000";

export default function SidebarNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<Roles | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await axios.get<AuthMeResponse>(`${API_URL}/auth/me`, {
          withCredentials: true,
        });
        setRole(mapRoleIdToRole(response.data.role_id));
      } catch {
        setRole(null);
      }
    };

    void fetchMe();
  }, []);

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
