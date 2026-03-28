"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppstoreOutlined,
  FileTextOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  ScheduleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  mapRoleIdToRole,
  roleHome,
  roleLinks,
  type Roles,
} from "@/types/role.types";
import { useAuth } from "@/components/providers/AuthProvider";

const navIconMap = {
  dashboard: HomeOutlined,
  "admin report": FileTextOutlined,
  "patient history": TeamOutlined,
  "medication order": MedicineBoxOutlined,
  "delivery history": ScheduleOutlined,
  "medication inventory": AppstoreOutlined,
} as const;

const getNavIcon = (name: string) => {
  const normalizedName = name.trim().toLowerCase();
  return navIconMap[normalizedName as keyof typeof navIconMap] ?? HomeOutlined;
};

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
    <aside className="sticky top-0 h-screen w-72 shrink-0 overflow-y-auto bg-[#157a72] px-6 py-7 text-white">
      <div className="flex min-h-full flex-col">
        <Link
          href={homePath}
          className="mb-8 block px-1 pt-2 pb-3"
        >
          <p className="text-[2.35rem] leading-[0.92] font-extrabold tracking-[-0.05em] text-white">
            Jitdee
          </p>
          
        </Link>

        <div className="mb-4 px-1" />

        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = getNavIcon(link.name);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-[#0f655d] text-white"
                    : "text-[#e7fcf7] hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-white/12 text-white"
                      : "bg-transparent text-[#d1fae5] group-hover:bg-white/10"
                  }`}
                >
                  <Icon />
                </span>
                <span className="min-w-0 truncate text-[1rem] font-medium">
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
