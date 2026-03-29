export type AdminStaffRoleId = 3 | 4 | 5;
export type AdminStaffStatus = "ACTIVE" | "INACTIVE";

export interface AdminStaffRecord {
  id: number;
  title: string | null;
  name: string;
  surName: string;
  fullName: string;
  email: string | null;
  roleId: AdminStaffRoleId;
  roleName: string;
  phone: string | null;
  info: string | null;
  degree: string | null;
  license: string | null;
  fileName: string | null;
  status: AdminStaffStatus;
  createdAt: string | null;
}

export interface AdminStaffFormValues {
  email: string;
  title?: string;
  name: string;
  surName: string;
  password?: string;
  roleId: AdminStaffRoleId;
  phone?: string;
  info?: string;
  degree?: string;
  license?: string;
  status: AdminStaffStatus;
}

export const ADMIN_STAFF_ROLE_OPTIONS: Array<{
  label: string;
  value: AdminStaffRoleId;
}> = [
  { label: "นักจิตวิทยา", value: 3 },
  { label: "จิตแพทย์", value: 4 },
  { label: "เภสัชกร", value: 5 },
];

export const ADMIN_STAFF_STATUS_OPTIONS: Array<{
  label: string;
  value: AdminStaffStatus;
}> = [
  { label: "เปิดใช้งาน", value: "ACTIVE" },
  { label: "ปิดใช้งาน", value: "INACTIVE" },
];
