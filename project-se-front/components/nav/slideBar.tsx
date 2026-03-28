"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AuditOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  HeartFilled,
  HistoryOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  MessageOutlined,
  ProfileOutlined,
  ScheduleOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import type { AuthMeResponse } from "@/types/auth.types";
import {
  mapRoleIdToRole,
  roleHome,
  roleLinks,
  type Roles,
} from "@/types/role.types";
import { useAuth } from "@/components/providers/AuthProvider";

const navNameIconMap = {
  dashboard: HomeOutlined,
  "admin report": FileTextOutlined,
  "patient history": TeamOutlined,
  "work schedule": CalendarOutlined,
  "medication order": MedicineBoxOutlined,
  "delivery history": ScheduleOutlined,
  "med inventory": AppstoreOutlined,
  "payment verification": AuditOutlined,
  "add staff": UserAddOutlined,
  "walk-in appointment": FileDoneOutlined,
} as const;

const navHrefIconMap = {
  "/staff/admin/admin-home": HomeOutlined,
  "/staff/admin/admin_work": CalendarOutlined,
  "/staff/admin/admin-report": FileTextOutlined,
  "/staff/admin/add-staff": UserAddOutlined,
  "/staff/admin/patient-history": FolderOpenOutlined,
  "/staff/admin/payment-verification": AuditOutlined,
  "/staff/admin/walkin-appointment": ProfileOutlined,
  "/staff/patient-history": HistoryOutlined,
  "/staff/appointments/med": CalendarOutlined,
  "/staff/consult": MessageOutlined,
  "/staff/pharmacist/pharmacist_home": HomeOutlined,
  "/staff/pharmacist/Phama_work": ScheduleOutlined,
  "/staff/pharmacist/order": MedicineBoxOutlined,
  "/staff/pharmacist/delivery-history": FileDoneOutlined,
  "/staff/pharmacist": AppstoreOutlined,
} as const;

const getNavIcon = (name: string, href: string) => {
  const iconByHref = navHrefIconMap[href as keyof typeof navHrefIconMap];

  if (iconByHref) {
    return iconByHref;
  }

  const normalizedName = name.trim().toLowerCase();
  return navNameIconMap[normalizedName as keyof typeof navNameIconMap] ?? HomeOutlined;
};

const matchesLink = (pathname: string, href: string) => {
  return pathname === href || pathname.startsWith(`${href}/`);
};

const buildDisplayName = (me: AuthMeResponse | null) => {
  const fullName = [me?.name, me?.sur_name].filter(Boolean).join(" ").trim();
  return fullName || "Unknown user";
};

export default function SidebarNav() {
  const pathname = usePathname();
  const { me } = useAuth();
  const displayName = buildDisplayName(me);
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
        <Link href={homePath} className="mb-4 block px-1 pt-2 pb-1">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <HeartFilled className="shrink-0 text-[1.15rem] text-[#bff7e8]" />
            <p className="m-0 whitespace-nowrap text-[2.1rem] leading-[0.92] font-extrabold tracking-[-0.05em] md:text-[2.35rem]">
              <span className="text-white">JitDee</span>{" "}
              <span className="text-[#bff7e8]">Clinic</span>
            </p>
          </div>

          <p className="mt-3 truncate text-sm font-medium text-[#d7fff4]">
            {displayName}
          </p>
        </Link>

        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const isActive = activeHref === link.href;
            const Icon = getNavIcon(link.name, link.href);

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
