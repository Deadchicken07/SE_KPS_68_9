"use client"

import { Layout, Button, Dropdown, Avatar } from "antd"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { UserOutlined } from "@ant-design/icons"

const { Header, Content } = Layout

const links = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Appointments", href: "/appointments" },
  { name: "Patients", href: "/patients" },
  { name: "Contact", href: "/contact" },
]

export default function ClinicLayout() {
  const pathname = usePathname()
  const router = useRouter()

  // สมมติ user login อยู่
  const user = {
    name: "Dr. Somchai"
  }

  const handleLogout = () => {
    router.push("/signin")
  }

  const menuItems = [
    {
      key: "profile",
      label: <Link href="/profile">Profile</Link>,
    },
    {
      key: "logout",
      label: <span onClick={handleLogout}>Logout</span>,
    },
  ]

  return (
    <Layout style={{ minHeight: "100vh" }}>
      
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#0f766e",
          padding: "0 32px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 1000
        }}
      >
        
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <h2 style={{ color: "#fff", margin: 0 }}>
            🏥 Mental Health Clinic
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                flex: 1,
                color: pathname === link.href ? "#fff" : "#d1fae5",
                fontWeight: pathname === link.href ? "bold" : "normal",
                padding: 40
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>
        {/* Right Side */}
        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
        >
          <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar icon={<UserOutlined />} />
            <span style={{ color: "#fff" }}>{user.name}</span>
          </div>
        </Dropdown>

      </Header>
    </Layout>
  )
}