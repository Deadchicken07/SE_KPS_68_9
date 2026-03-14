"use client";

import { useState } from "react";
import { Layout, Dropdown, Modal } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PhoneOutlined, HeartFilled } from "@ant-design/icons";
import { navigateToAppointmentsWithLoginGuard } from "@/utils/guardedNavigation";

const { Header } = Layout;

const links = [
  { name: "หน้าเเรก", href: "/user" },
  { name: "เเบบทดสอบ", href: "/user/exams" },
  { name: "บริการของเรา", href: "/user/ourservices" },
  { name: "เกี่ยวกับเรา", href: "/user/ourstaff" },
  { name: "นัดหมายการปรึกษา", href: "/user/appointments" },
];

export default function ClinicLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const [isLogin, setIsLogin] = useState(false);

  const handleLogout = () => {
    router.push("/signin");
  };

  const menuItems = [
    { key: "profile", label: <Link href="/profile">Profile</Link> },
    { key: "logout", label: <span onClick={handleLogout}>Logout</span> },
  ];

  return (
    <Layout style={{ minHeight: "auto" }}>
      {modalContextHolder}
      <Header
        style={{
          backgroundColor: "#ffffff",
          height: 100,
        }}
      >
        <div
          style={{
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 32px",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 39,
              fontWeight: 700,
              letterSpacing: 1,
              cursor: "pointer",
            }}
          >
            <HeartFilled style={{ color: "#0f766e", fontSize: 22 }} />
            <span style={{ color: "#111" }}>JitDee</span>
            <span style={{ color: "#0f766e" }}>Clinic</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
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
              096-767-6767
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {isLogin ? (
                <Dropdown menu={{ items: menuItems }}>
                  <span style={{ cursor: "pointer" }}>Hello</span>
                </Dropdown>
              ) : (
                <>
                  <Link href="/login/regis">
                    <div
                      style={{
                        display: "flex",
                        padding: "8px 20px",
                        borderRadius: 999,
                        border: "1px solid #0f766e",
                        color: "#0f766e",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "0.2s",
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      Sign Up
                    </div>
                  </Link>

                  <Link href="/login">
                    <div
                      style={{
                        display: "flex",
                        padding: "8px 20px",
                        borderRadius: 999,
                        backgroundColor: "#0f766e",
                        color: "#fff",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "0.2s",
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      Login
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </Header>

      <Header
        style={{
          backgroundColor: "#0f766e",
          height: 50,
          lineHeight: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {links.map((link) =>
          link.href === "/user/appointments" ? (
            <button
              key={link.href}
              type="button"
              onClick={() => navigateToAppointmentsWithLoginGuard(router, modalApi)}
              style={{
                color: pathname === link.href ? "#fff" : "#d1fae5",
                fontWeight: pathname === link.href ? "bold" : "normal",
                fontSize: 18,
                padding: 36,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {link.name}
            </button>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: pathname === link.href ? "#fff" : "#d1fae5",
                fontWeight: pathname === link.href ? "bold" : "normal",
                fontSize: 18,
                padding: 36,
              }}
            >
              {link.name}
            </Link>
          ),
        )}
      </Header>
    </Layout>
  );
}
