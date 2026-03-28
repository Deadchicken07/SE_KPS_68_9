"use client";

import axios from "axios";
import { Avatar, Dropdown, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { AuthMeResponse } from "@/types/auth.types";
import { mapRoleIdToRole, type Roles } from "@/types/role.types";
import { useAuth } from "@/components/providers/AuthProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const roleLabelMap: Record<Roles, string> = {
  admin: "ADMIN",
  user: "USER",
  psychologist: "PSYCHOLOGIST",
  psychiatrist: "PSYCHIATRIST",
  pharmacist: "PHARMACIST",
};

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

export default function StaffTopBar() {
  const router = useRouter();
  const { me, setMe } = useAuth();

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch {
      // Redirect even if session cleanup already happened.
    } finally {
      localStorage.removeItem("access_token");
      setMe(null);
      router.push("/login");
      router.refresh();
    }
  };

  const role = mapRoleIdToRole(me?.role_id ?? null);
  const displayName = buildDisplayName(me);
  const avatarLabel = buildAvatarLabel(me);
  const avatarSrc = me?.file_name || undefined;

  const menuItems: MenuProps["items"] = [
    {
      key: "logout",
      label: "Logout",
    },
  ];

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "18px 24px",
        borderBottom: "1px solid rgba(15, 118, 110, 0.14)",
        background:
          "linear-gradient(180deg, rgba(247, 251, 249, 0.96) 0%, rgba(255, 255, 255, 0.9) 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div>
        <Typography.Text
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#0f766e",
          }}
        >
          STAFF CONSOLE
        </Typography.Text>
        <Typography.Title
          level={4}
          style={{ margin: "4px 0 0", color: "#173f35" }}
        >
          {role ? roleLabelMap[role] : "STAFF"}
        </Typography.Title>
      </div>

      <Dropdown
        menu={{
          items: menuItems,
          onClick: ({ key }) => {
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
            <Typography.Text style={{ color: "#4d6b63", fontSize: 12 }}>
              {role ? roleLabelMap[role] : "STAFF"}
            </Typography.Text>
          </div>

          <Space style={{ color: "#0f766e", fontSize: 12 }}>▼</Space>
        </button>
      </Dropdown>
    </div>
  );
}
