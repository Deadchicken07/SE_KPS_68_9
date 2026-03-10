"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavLinks } from "@/types/role.types";
import { Roles } from "@/types/role.types";

const role : Roles = "admin" ;
let links: NavLinks[] = [];

if (role === "admin"){
    links = [
    { name: "Dashboard", href: "/staff" },
    { name: "Users", href: "/staff/users" },
    { name: "Reports", href: "/staff/reports" },
  ]
}else{
    links = [
    { name: "Dashboard", href: "/staff" },
    { name: "Users", href: "/staff/users" },
  ]
}

export default function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-gray-900 text-white min-h-screen p-6">
      <h2 className="text-xl font-bold mb-6">Staff Panel</h2>

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