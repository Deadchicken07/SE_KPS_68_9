"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "หน้าแรก" },
  { href: "/service", label: "บริการ" },
  { href: "/counselor", label: "ผู้ให้คำปรึกษา" },
  { href: "/user", label: "login" },
] as const;

export default function TopBar() {
  const pathname = usePathname();

  return (
    <nav className="service-topbar">
      <h2 className="service-topbar__brand">jitdee</h2>
      <div className="service-topbar__links">
        {navLinks.map((link) => (
          <Link key={link.href} className={getLinkClassName(pathname, link.href)} href={link.href}>
            {link.label}
          </Link>
        ))}
        <Link className="service-topbar__signup" href="/staff">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}

function getLinkClassName(pathname: string, href: string) {
  const isActive = href === "/" ? pathname === "/" || pathname === "/home" : pathname === href;
  return isActive ? "service-topbar__link is-active" : "service-topbar__link";
}
