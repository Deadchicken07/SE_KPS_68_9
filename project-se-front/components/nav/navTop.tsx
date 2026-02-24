"use client"

import { Layout, Avatar, Dropdown } from "antd"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { UserOutlined } from "@ant-design/icons"
import { PhoneOutlined, HeartFilled } from "@ant-design/icons"

const { Header, Content } = Layout

const links = [
  { name: "หน้าเเรก", href: "/user" },
  { name: "เเบบทดสอบ", href: "/exams" },
  { name: "บริการของเรา", href: "/appointments" },
  { name: "เกี่ยวกับเรา", href: "/user/staff/all" },
  { name: "ติดต่อเรา", href: "/contact" },
]

export default function ClinicLayout() {
  const pathname = usePathname()
  const router = useRouter()

  const user = { name: "Mung kai wa" }

  const handleLogout = () => {
    router.push("/signin")
  }

  const menuItems = [
    { key: "profile", label: <Link href="/profile">Profile</Link> },
    { key: "logout", label: <span onClick={handleLogout}>Logout</span> },
  ]

  return (
    <Layout style={{ minHeight: "auto", }}>

      <Header
        style={{
          backgroundColor: "#ffffff",
          height: 100
        }}
      >
        <div
          style={{
            // maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 32px",
            height: "100%"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 39,
              fontWeight: 700,
              letterSpacing: 1,
              cursor: "pointer"
            }}
          >
            <HeartFilled style={{ color: "#0f766e", fontSize: 22 }} />
            <span style={{ color: "#111" }}>JitDee</span>
            <span style={{ color: "#0f766e" }}>.com</span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 20
          }}>
            <div
              style={{
                display: "flex",
                gap: 8,
                backgroundColor: "#e6fffb",
                padding: "8px 16px",
                borderRadius: 1000,
                fontWeight: 500,
                alignItems: "center",
                color: "#065f46",
                width: "fit-content",
                height: 40,
              }}
            >
              <PhoneOutlined />
              02-745-4184
            </div>
            <Dropdown menu={{ items: menuItems }}>
              <div style={{ cursor: "pointer", gap: 10, display: "flex", alignItems: "center", }}>
                <Avatar icon={<UserOutlined />} />
                <span style={{ color: "#000000" }}>{user.name}</span>
              </div>
            </Dropdown>
          </div>
        </div>
      </Header>
      <Header
        style={{
          backgroundColor: "#0f766e",
          height: 50,           // 👈 กำหนดเอง
          lineHeight: "50px",   // 👈 สำคัญ
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: pathname === link.href ? "#fff" : "#d1fae5",
              fontWeight: pathname === link.href ? "bold" : "normal",
              fontSize: 18,
              padding: 36
            }}
          >
            {link.name}
          </Link>
        ))}
      </Header>

    </Layout>
  )
}