"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { name: "Home", href: "/user" },
  { name: "Profile", href: "/user/profile" },
  { name: "Settings", href: "/user/settings" },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex gap-6">
      {links.map((link) => {
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`hover:underline ${
              isActive ? "font-bold underline" : ""
            }`}
          >
            {link.name}
          </Link>
        )
      })}
    </nav>
  )
}