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
    { name: "Admin Report", href: "/staff/admin-report" },
  ],
  user: [{ name: "หน้าแรก", href: "/user" }],
  psychologist: [{ name: "Patient History", href: "/staff/patient-history" }],
  psychiatrist: [
    { name: "Patient History", href: "/staff/patient-history" },
    { name: "การนัดหมาย", href: "/staff/appointments" },
    { name: "การปรึกษา", href: "/staff/consult" },
  ],
  pharmacist: [
    { name: "Pharmacist", href: "/staff/pharmacist" },
    { name: "Medication Order", href: "/staff/pharmacist/order" },
    { name: "Delivery History", href: "/staff/pharmacist/delivery-history" },
  ],
};

export const roleHome: Record<Roles, string> = {
  admin: "/staff/admin-report",
  user: "/user",
  psychologist: "/staff/patient-history",
  psychiatrist: "/staff/patient-history",
  pharmacist: "/staff/pharmacist",
};
