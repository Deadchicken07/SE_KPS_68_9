export interface AddressPayload {
  provinceId: number;
  districtId: number;
  subDistrictId: number;
  detail: string;
}

export interface RegisterPayload {
  email: string;
  name: string;
  surName: string;
  password: string;
  phone?: string;
  nationId?: string;
  medicalCondition?: string;
  allergyDrug?: string;
  address: AddressPayload;
  addressNation?: AddressPayload;
}