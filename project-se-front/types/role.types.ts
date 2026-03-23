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
    { name: "Admin Report", href: "/staff/admin-report" },
  ],
  user: [{ name: "Home", href: "/user" }],
  psychologist: [
    {
      name: "Dashboard",
      href: "/staff/role-psychiatrist-psychologists/psychologist",
    },
    { name: "Patient History", href: "/staff/patient-history" },
  ],
  psychiatrist: [
    {
      name: "Dashboard",
      href: "/staff/role-psychiatrist-psychologists/psychiatrist",
    },
    { name: "Patient History", href: "/staff/patient-history" },
    { name: "Appointments", href: "/staff/appointments" },
    { name: "Consultations", href: "/staff/consult" },
  ],
  pharmacist: [
    { name: "Dashboard", href: "/staff/pharmacist_home" },
    { name: "Medication Order", href: "/staff/pharmacist/order" },
    { name: "Delivery History", href: "/staff/pharmacist/delivery-history" },
    { name: "Medication Inventory", href: "/staff/pharmacist" },
  ],
};

export const roleHome: Record<Roles, string> = {
  admin: "/staff/admin-home",
  user: "/user",
  psychologist: "/staff/role-psychiatrist-psychologists/psychologist",
  psychiatrist: "/staff/role-psychiatrist-psychologists/psychiatrist",
  pharmacist: "/staff/pharmacist_home",
};
