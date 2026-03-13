export class AddressDto {
  provinceId: number;
  districtId: number;
  subDistrictId: number;
  detail: string;
  zipCodeId: number;
}

export class RegisterDto {
  title?: string;
  email: string;
  name: string;
  surName: string;
  password: string;
  phone?: string;
  nationId?: string;
  medicalCondition?: string;
  allergyDrug?: string;
  address: AddressDto;
  addressNation?: AddressDto;
}
export class CreateDoctorDto {
  email: string;
  name: string;
  surName: string;
  password: string;

  degree: string;
  license: string;

  info?: string;
  fileName?: string;
  status?: string;
}
