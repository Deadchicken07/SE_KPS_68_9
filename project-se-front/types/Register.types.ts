import type { Dispatch, SetStateAction } from "react";

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
export type RegisterForm = {
  nationId: string;
  email: string;
  name: string;
  surName: string;
  password: string;
  confirmPassword: string;
  title: string | null;
  phone: string;
  medicalCondition: string;
  allergyDrug: string;
  detail: string;
  detailNation: string;
};

export interface FormErrors  {
  nationId?: string;
  email?: string;
  name?: string;
  surName?: string;
  title?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  medicalCondition?: string;
  allergyDrug?: string;
  currentProvince?: string;
  currentDistrict?: string;
  currentSubDistrict?: string;
  currentZipCode?: string;
  nationProvince?: string;
  nationDistrict?: string;
  nationSubDistrict?: string;
  nationZipCode?: string;
  detailNation?: string;
  detail?: string;
};
export interface LocationItem {
  id: number;
  name: string;
}

export interface LocationDropdownState {
  provinces: LocationItem[];
  districts: LocationItem[];
  subDistricts: LocationItem[];
  zipCodes: LocationItem[];
  selectedProvince: number | null;
  selectedDistrict: number | null;
  selectedSubDistrict: number | null;
  selectedZipCode: number | null;
  setSelectedProvince: Dispatch<SetStateAction<number | null>>;
  setSelectedDistrict: Dispatch<SetStateAction<number | null>>;
  setSelectedSubDistrict: Dispatch<SetStateAction<number | null>>;
  setSelectedZipCode: Dispatch<SetStateAction<number | null>>;
}
