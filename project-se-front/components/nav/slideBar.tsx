"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppstoreOutlined,
  CalendarOutlined,
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
  "work schedule": CalendarOutlined,
  "medication order": MedicineBoxOutlined,
  "delivery history": ScheduleOutlined,
  "medication inventory": AppstoreOutlined,
} as const;

const getNavIcon = (name: string) => {
  const normalizedName = name.trim().toLowerCase();
  return navIconMap[normalizedName as keyof typeof navIconMap] ?? HomeOutlined;
};

const matchesLink = (pathname: string, href: string) => {
  return pathname === href || pathname.startsWith(`${href}/`);
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
  const activeHref = useMemo(() => {
    return [...links]
      .filter((link) => matchesLink(pathname, link.href))
      .sort((left, right) => right.href.length - left.href.length)[0]?.href ?? null;
  }, [links, pathname]);

  return (
    <aside className="sticky top-0 h-screen w-64 max-w-[82vw] shrink-0 overflow-x-hidden overflow-y-auto bg-[#157a72] px-5 py-6 text-white md:w-72 md:px-6 md:py-7">
      <div className="flex min-h-full flex-col">
        <Link
          href={homePath}
          className="mb-2 block px-1 pt-2 pb-1"
        >
          <p className="text-[2.1rem] leading-[0.92] font-extrabold tracking-[-0.05em] text-white md:text-[2.35rem]">
            Jitdee
          </p>
          
        </Link>

        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const isActive = activeHref === link.href;
            const Icon = getNavIcon(link.name);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-all duration-200 md:px-4 ${
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
                <span className="min-w-0 truncate text-[0.97rem] font-medium md:text-[1rem]">
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
