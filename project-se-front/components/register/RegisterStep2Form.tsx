"use client";

import type { Dispatch, SetStateAction } from "react";
import Select, { StylesConfig } from "react-select";
import { formatPhoneNumber } from "@/utils/formatPhoneNumber";
import type {
  FormErrors,
  LocationDropdownState,
  RegisterForm,
} from "@/types/Register.types";
import Label from "./Label";

type SelectOption = {
  value: number;
  label: string;
};

interface RegisterStep2Props {
  form: RegisterForm;
  errors: FormErrors;
  setForm: Dispatch<SetStateAction<RegisterForm>>;
  titles: string[];
  handleSubmit: () => void;
  sendOtpLoading: boolean;
  registerLoading: boolean;
  successMessage: string | null;
  current: LocationDropdownState;
  nation: LocationDropdownState;
}

interface AddressSectionProps {
  title: string;
  detailValue: string;
  detailError?: string;
  detailOnChange: (value: string) => void;
  location: LocationDropdownState;
  errors: {
    province?: string;
    district?: string;
    subDistrict?: string;
    zipCode?: string;
  };
}

const getSelectStyle = (
  hasError: boolean,
): StylesConfig<SelectOption, false> => ({
  control: (base) => ({
    ...base,
    borderRadius: "12px",
    borderColor: hasError ? "#ef4444" : "#3F7F6D",
    boxShadow: "none",
    "&:hover": {
      borderColor: hasError ? "#ef4444" : "#2F6E5D",
    },
  }),
});

function AddressSection({
  title,
  detailValue,
  detailError,
  detailOnChange,
  location,
  errors,
}: AddressSectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-[#2F6E5D]">{title}</h4>

      <input
        placeholder="รายละเอียดที่อยู่"
        value={detailValue}
        onChange={(e) => detailOnChange(e.target.value)}
        className="input"
      />
      {detailError && <p className="text-red-500 text-sm">{detailError}</p>}

      <div className="grid grid-cols-2 gap-4">
        <Select
          styles={getSelectStyle(!!errors.province)}
          options={location.provinces.map((p) => ({ value: p.id, label: p.name }))}
          value={
            location.provinces
              .map((p) => ({ value: p.id, label: p.name }))
              .find((o) => o.value === location.selectedProvince) || null
          }
          onChange={(o) => location.setSelectedProvince(o ? o.value : null)}
          placeholder="เลือกจังหวัด"
        />

        <Select
          styles={getSelectStyle(!!errors.district)}
          options={location.districts.map((d) => ({ value: d.id, label: d.name }))}
          value={
            location.districts
              .map((d) => ({ value: d.id, label: d.name }))
              .find((o) => o.value === location.selectedDistrict) || null
          }
          onChange={(o) => location.setSelectedDistrict(o ? o.value : null)}
          placeholder="เลือกอำเภอ"
          isDisabled={!location.selectedProvince}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          styles={getSelectStyle(!!errors.subDistrict)}
          options={location.subDistricts.map((s) => ({ value: s.id, label: s.name }))}
          value={
            location.subDistricts
              .map((s) => ({ value: s.id, label: s.name }))
              .find((o) => o.value === location.selectedSubDistrict) || null
          }
          onChange={(o) => location.setSelectedSubDistrict(o ? o.value : null)}
          placeholder="เลือกตำบล"
          isDisabled={!location.selectedDistrict}
        />

        <Select
          styles={getSelectStyle(!!errors.zipCode)}
          options={location.zipCodes.map((z) => ({ value: z.id, label: z.name }))}
          value={
            location.zipCodes
              .map((z) => ({ value: z.id, label: z.name }))
              .find((o) => o.value === location.selectedZipCode) || null
          }
          onChange={(o) => location.setSelectedZipCode(o ? o.value : null)}
          placeholder="เลือกรหัสไปรษณีย์"
          isDisabled={!location.selectedSubDistrict}
        />
      </div>
    </div>
  );
}

export default function RegisterStep2Form({
  form,
  errors,
  setForm,
  titles,
  handleSubmit,
  sendOtpLoading,
  registerLoading,
  successMessage,
  current,
  nation,
}: RegisterStep2Props) {
  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="grid grid-cols-[1fr_2fr_2fr] gap-6">
          <div>
            <Label text="คำนำหน้า" />

            <select
              value={form.title ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value || null,
                }))
              }
              className={`input ${errors.title ? "border-red-500" : ""}`}
            >
              <option value=""></option>

              {titles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label text="ชื่อ" />

            <input
              placeholder="ชื่อ"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ""),
                }))
              }
              className={`input ${errors.name ? "border-red-500" : ""}`}
            />

            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label text="นามสกุล" />

            <input
              placeholder="นามสกุล"
              value={form.surName}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  surName: e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ""),
                }))
              }
              className={`input ${errors.surName ? "border-red-500" : ""}`}
            />

            {errors.surName && <p className="text-red-500 text-sm mt-1">{errors.surName}</p>}
          </div>
        </div>

        <Label text="Email" />
        <input
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          className={`input ${errors.email ? "border-red-500" : ""}`}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label text="รหัสผ่าน" />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className={`input ${errors.password ? "border-red-500" : ""}`}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <div>
            <Label text="ยืนยันรหัสผ่าน" />
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              className={`input ${errors.confirmPassword ? "border-red-500" : ""}`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label text="เบอร์โทร" />
            <input
              value={form.phone}
              pattern="[0-9]*"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  phone: formatPhoneNumber(e.target.value),
                }))
              }
              className="input"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <Label text="โรคประจำตัว" />
            <input
              placeholder="ถ้าไม่มีให้ใส่ -"
              value={form.medicalCondition}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  medicalCondition: e.target.value,
                }))
              }
              className="input"
            />
            {errors.medicalCondition && (
              <p className="text-red-500 text-sm">{errors.medicalCondition}</p>
            )}
          </div>

          <div>
            <Label text="แพ้ยา" />
            <input
              placeholder="ถ้าไม่มีให้ใส่ -"
              value={form.allergyDrug}
              onChange={(e) => setForm((prev) => ({ ...prev, allergyDrug: e.target.value }))}
              className="input"
            />
            {errors.allergyDrug && <p className="text-red-500 text-sm">{errors.allergyDrug}</p>}
          </div>
        </div>
      </div>

      <AddressSection
        title="ที่อยู่ปัจจุบัน *"
        detailValue={form.detail}
        detailError={errors.detail}
        detailOnChange={(value) => setForm((prev) => ({ ...prev, detail: value }))}
        location={current}
        errors={{
          province: errors.currentProvince,
          district: errors.currentDistrict,
          subDistrict: errors.currentSubDistrict,
          zipCode: errors.currentZipCode,
        }}
      />

      <AddressSection
        title="ที่อยู่ตามบัตรประชาชน *"
        detailValue={form.detailNation}
        detailError={errors.detailNation}
        detailOnChange={(value) => setForm((prev) => ({ ...prev, detailNation: value }))}
        location={nation}
        errors={{
          province: errors.nationProvince,
          district: errors.nationDistrict,
          subDistrict: errors.nationSubDistrict,
          zipCode: errors.nationZipCode,
        }}
      />

      <button onClick={handleSubmit} disabled={sendOtpLoading} className="btn-primary">
        {sendOtpLoading ? "กำลังส่ง OTP..." : "สมัครสมาชิก"}
      </button>

      {successMessage && <p className="text-green-600 text-center text-sm">{successMessage}</p>}
    </div>
  );
}
