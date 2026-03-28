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
    { name: "Dashboard", href: "/staff/admin/admin-home" },
    { name: "Clinic Holiday", href: "/staff/admin/admin_work" },
    { name: "Admin Report", href: "/staff/admin/admin-report" },
    { name: "Add Staff", href: "/staff/admin/add-staff" },
    { name: "Patient History", href: "/staff/admin/patient-history" },
    { name: "Payment Verification", href: "/staff/admin/payment-verification" },
    { name: "Walk-in Appointment", href: "/staff/admin/walkin-appointment" },
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
  psychologist: "/staff/patient-history",
  psychiatrist: "/staff/patient-history",
  pharmacist: "/staff/pharmacist/pharmacist_home",
};
