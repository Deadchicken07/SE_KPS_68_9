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

export const authPages = ["/login", "/login/regis"] as const;

export const userProtectedPrefixes = [
  "/user/appointments",
  "/user/profile",
  "/user/schedule",
  "/user/payment",
  "/user/payment-medicine",
] as const;

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
    { name: "Dashboard", href: "/staff/admin/admin-home" },
    { name: "Staff Holiday", href: "/staff/admin/admin_work" },
    { name: "Admin Report", href: "/staff/admin/admin-report" },
    { name: "Add Staff", href: "/staff/admin/add-staff" },
    { name: "Manage Staff", href: "/staff/admin/admin_manage" },
    { name: "Patient History", href: "/staff/admin/patient-history" },
    { name: "Payment Verification", href: "/staff/admin/payment-verification" },
    { name: "Walk-in Appointment", href: "/staff/admin/walkin-appointment" },
    { name: "Medication Payment", href: "/staff/admin/medication-payment" },
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
    { name: "Dashboard", href: "/staff/pharmacist/pharmacist_home" },
    { name: "Work Schedule", href: "/staff/pharmacist/Phama_work" },
    { name: "Medication Order", href: "/staff/pharmacist/order" },
    { name: "Delivery History", href: "/staff/pharmacist/delivery-history" },
    { name: "Med Inventory", href: "/staff/pharmacist" },
  ],
};

export const roleHome: Record<Roles, string> = {
  admin: "/staff/admin/admin-home",
  user: "/user",
  psychologist: "/staff/role-psychiatrist-psychologists/psychologist",
  psychiatrist: "/staff/role-psychiatrist-psychologists/psychiatrist",
  pharmacist: "/staff/pharmacist/pharmacist_home",
};

export const roleRoutePrefixes: Record<Roles, readonly string[]> = {
  admin: ["/staff/admin"],
  user: ["/user", ...userProtectedPrefixes],
  psychologist: [
    "/staff/patient-history",
    "/staff/appointments",
    "/staff/consult",
  ],
  psychiatrist: [
    "/staff/patient-history",
    "/staff/appointments",
    "/staff/consult",
  ],
  pharmacist: ["/staff/pharmacist"],
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
