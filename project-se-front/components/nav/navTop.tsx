"use client";

import { useEffect, useState } from "react";
import { Avatar, Dropdown, Layout, Modal, Space, Typography } from "antd";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PhoneOutlined, HeartFilled, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import type { AuthMeResponse } from "@/types/auth.types";
import { navigateToAppointmentsWithLoginGuard } from "@/utils/guardedNavigation";
import { useAuth } from "@/components/providers/AuthProvider";

const { Header } = Layout;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const links = [
  { name: "หน้าแรก", href: "/user" },
  { name: "แบบทดสอบ", href: "/user/exams" },
  { name: "บริการของเรา", href: "/user/ourservices" },
  { name: "เกี่ยวกับเรา", href: "/user/ourstaff" },
  { name: "นัดหมายการปรึกษา", href: "/user/appointments" },
];

const buildDisplayName = (me: AuthMeResponse | null) => {
  const fullName = [me?.name, me?.sur_name].filter(Boolean).join(" ").trim();
  return fullName || "Unknown user";
};

const buildAvatarLabel = (me: AuthMeResponse | null) => {
  const fullName = buildDisplayName(me);
  const parts = fullName.split(" ").filter(Boolean);

  if (parts.length === 0 || fullName === "Unknown user") {
    return "U";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export default function ClinicLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const [mounted, setMounted] = useState(false);
  const { me, setMe, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch {
      // Redirect even if the session is already gone.
    } finally {
      localStorage.removeItem("access_token");
      setMe(null);
      router.push("/login");
      router.refresh();
    }
  };

  const menuItems: MenuProps["items"] = [
    { key: "profile", label: "Profile" },
    { key: "logout", label: "Logout" },
  ];

  const isReady = mounted && !loading;
  const isLogin = isReady && !!me;
  const displayName = buildDisplayName(me);
  const avatarLabel = buildAvatarLabel(me);
  const avatarSrc = me?.file_name || undefined;

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
              {!isReady ? (
                <button
                  aria-hidden="true"
                  disabled
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    color: "#173f35",
                    cursor: "default",
                  }}
                >
                  <Avatar
                    size={44}
                    style={{
                      backgroundColor: "#d9ece8",
                      color: "transparent",
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ minWidth: 0, textAlign: "left" }}>
                    <Typography.Text
                      strong
                      style={{
                        display: "block",
                        maxWidth: 220,
                        color: "#173f35",
                      }}
                      ellipsis
                    >
                      <span
                        style={{
                          display: "block",
                          width: 160,
                          height: 16,
                          borderRadius: 999,
                          background: "linear-gradient(90deg, #e6efec 25%, #f2f7f5 50%, #e6efec 75%)",
                          backgroundSize: "200% 100%",
                          animation: "authSkeletonShimmer 1.4s ease-in-out infinite",
                        }}
                      />
                    </Typography.Text>
                    <Typography.Text
                      style={{
                        display: "block",
                        maxWidth: 220,
                        color: "#4d6b63",
                        fontSize: 12,
                      }}
                      ellipsis
                    >
                      <span
                        style={{
                          display: "block",
                          width: 220,
                          height: 12,
                          borderRadius: 999,
                          background: "linear-gradient(90deg, #e6efec 25%, #f2f7f5 50%, #e6efec 75%)",
                          backgroundSize: "200% 100%",
                          animation: "authSkeletonShimmer 1.4s ease-in-out infinite",
                        }}
                      />
                    </Typography.Text>
                  </div>
                  <Space style={{ color: "transparent", fontSize: 12 }}>▼</Space>
                </button>
              ) : isLogin ? (
                <Dropdown
                  menu={{
                    items: menuItems,
                    onClick: ({ key }) => {
                      if (key === "profile") {
                        router.push("/user/profile");
                        return;
                      }

                      if (key === "logout") {
                        void handleLogout();
                      }
                    },
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <button
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 0,
                      border: "none",
                      background: "transparent",
                      color: "#173f35",
                      cursor: "pointer",
                    }}
                  >
                    <Avatar
                      size={44}
                      src={avatarSrc}
                      icon={!avatarSrc ? <UserOutlined /> : undefined}
                      style={{
                        backgroundColor: avatarSrc ? "transparent" : "#0f766e",
                        color: "#ffffff",
                        flexShrink: 0,
                      }}
                    >
                      {!avatarSrc ? avatarLabel : null}
                    </Avatar>

                    <div style={{ minWidth: 0, textAlign: "left" }}>
                      <Typography.Text
                        strong
                        style={{
                          display: "block",
                          maxWidth: 220,
                          color: "#173f35",
                        }}
                        ellipsis
                      >
                        {displayName}
                      </Typography.Text>
                      <Typography.Text
                        style={{
                          display: "block",
                          maxWidth: 220,
                          color: "#4d6b63",
                          fontSize: 12,
                        }}
                        ellipsis
                      >
                        {me?.email || "Signed in"}
                      </Typography.Text>
                    </div>

                    <Space style={{ color: "#0f766e", fontSize: 12 }}>▼</Space>
                  </button>
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
