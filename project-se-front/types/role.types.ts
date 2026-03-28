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
    { name: "Admin Report", href: "/staff/admin/admin-report" },
  ],
  user: [{ name: "Home", href: "/user" }],
  psychologist: [
    {
      name: "Dashboard",
      href: "/staff/role-psychiatrist-psychologists/psychologist",
    },
    {
      name: "Leave Form",
      href: "/staff/role-psychiatrist-psychologists/psychologist-leave",
    },
    { name: "Patient History", href: "/staff/patient-history" },
    { name: "Appointments", href: "/staff/appointments/med" },
    { name: "Consultations", href: "/staff/consult" },
  ],
  psychiatrist: [
    {
      name: "Dashboard",
      href: "/staff/role-psychiatrist-psychologists/psychiatrist",
    },
    {
      name: "Leave Form",
      href: "/staff/role-psychiatrist-psychologists/psychiatrist-leave",
    },
    { name: "Patient History", href: "/staff/patient-history" },
    { name: "Appointments", href: "/staff/appointments/med" },
    { name: "Consultations", href: "/staff/consult" },
  ],
  pharmacist: [
    { name: "Dashboard", href: "/staff/pharmacist_home" },
    { name: "Work Schedule", href: "/staff/pharmacist_home/Phama_work" },
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

export const canRoleAccessPath = (
  role: Roles,
  pathname: string | null | undefined,
) => {
  if (!pathname) {
    return false;
  }

  if (pathname === roleHome[role]) {
    return true;
  }

  if (pathname === "/staff") {
    return true;
  }

  return roleLinks[role].some((link) => {
    if (pathname === link.href) {
      return true;
    }

    return pathname.startsWith(`${link.href}/`);
  });
};
