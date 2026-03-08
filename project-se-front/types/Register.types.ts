export interface AddressPayload {
  provinceId: number;
  districtId: number;
  subDistrictId: number;
  detail: string;
  zipCodeId: number;
}

export interface RegisterPayload {
  email: string;
  name: string;
  surName: string;
  password: string;
 title: string | null
  phone?: string;
  nationId?: string;
  medicalCondition?: string;
  allergyDrug?: string;
  address: AddressPayload;
  addressNation?: AddressPayload;
}