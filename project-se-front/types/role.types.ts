export interface NavLinks {
  name: string;
  href: string;
}

export type Roles =
  | "admin"
  | "user"
  | "psychologist"
  | "psychiatrist"
  | "pharmacist";

export const mapRoleIdToRole = (roleId: number | null): Roles | null => {
  switch (roleId) {
    case 1:
      return "admin";
    case 2:
      return "user";
    case 3:
      return "psychologist";
    case 4:
      return "psychiatrist";
    case 5:
      return "pharmacist";
    default:
      return null;
  }
};

export const roleLinks: Record<Roles, NavLinks[]> = {
  admin: [
    { name: "Dashboard", href: "/staff/admin-home" },
    { name: "Work Schedule", href: "/staff/admin-home/admin_work" },
    { name: "Admin Report", href: "/staff/admin-report" },
  ],
  user: [{ name: "หน้าแรก", href: "/user" }],
  psychologist: [
    { name: "Patient History", href: "/staff/patient-history" },
    { name: "การนัดหมาย", href: "/staff/appointments/med" },
    { name: "การปรึกษา", href: "/staff/consult" },
  ],
  psychiatrist: [
    { name: "Patient History", href: "/staff/patient-history" },
    { name: "การนัดหมาย", href: "/staff/appointments/med" },
    { name: "การปรึกษา", href: "/staff/consult" },
  ],
  pharmacist: [
    { name: "Dashboard", href: "/staff/pharmacist_home" },
    { name: "Work Schedule", href: "/staff/pharmacist_home/Phama_work" },
    { name: "Medication Order", href: "/staff/pharmacist/order" },
    { name: "Delivery History", href: "/staff/pharmacist/delivery-history" },
    { name: "Med Inventory", href: "/staff/pharmacist" },
  ],
};

export const roleHome: Record<Roles, string> = {
  admin: "/staff/admin-home",
  user: "/user",
  psychologist: "/staff/patient-history",
  psychiatrist: "/staff/appointment",
  pharmacist: "/staff/pharmacist_home",
};
