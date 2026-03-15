"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavLinks } from "@/types/role.types";
import { Roles } from "@/types/role.types";

const role : Roles = "admin" ;
let links: NavLinks[] = [];

if (role === "admin"){
    links = [
    { name: "Clinic Schedule", href: "/staff/admin-home" },
    { name: "Patient History", href: "/staff/patient-history" },
    { name: "Reports", href: "/staff/admin-report" },
  ]
}else{
    links = [
    { name: "Clinic Schedule", href: "/staff/admin-home" },
    { name: "Patient History", href: "/staff/patient-history" },
  ]
}

export default function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-gray-900 text-white min-h-screen p-6">
      <h2 className="text-xl font-bold mb-2">Staff Panel</h2>
      <p className="mb-6 text-sm text-gray-400">Clinic operations</p>

      <div className="flex flex-col gap-4">
        {links.map((link) => {
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`p-2 rounded ${
                isActive
                  ? "bg-gray-700"
                  : "hover:bg-gray-800"
              }`}
            >
              {link.name}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
