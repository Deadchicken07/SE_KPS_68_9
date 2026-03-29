export class CreateAdminStaffDto {
  email!: string;
  title?: string;
  name!: string;
  surName!: string;
  password!: string;
  roleId!: number;
  phone?: string;
  info?: string;
  degree?: string;
  license?: string;
  fileName?: string;
  status?: string;
}
