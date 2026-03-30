"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Button, Checkbox, Input, Select } from "antd";
import { formatPhoneNumber } from "@/utils/formatPhoneNumber";
import type {
  FormErrors,
  LocationDropdownState,
  RegisterForm,
} from "@/types/Register.types";
import Label from "./Label";
import styles from "./RegisterStep2Form.module.css";

interface RegisterStep2Props {
  form: RegisterForm;
  errors: FormErrors;
  setForm: Dispatch<SetStateAction<RegisterForm>>;
  titles: string[];
  handleSubmit: () => void;
  submitLoading: boolean;
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
  disabled?: boolean;
  errors: {
    province?: string;
    district?: string;
    subDistrict?: string;
    zipCode?: string;
  };
}

function AddressSection({
  title,
  detailValue,
  detailError,
  detailOnChange,
  location,
  disabled = false,
  errors,
}: AddressSectionProps) {
  return (
    <div className="space-y-5">
      <h4 className="text-lg font-semibold text-[#0e5b50]">{title}</h4>

      <Input
        size="large"
        placeholder="รายละเอียดที่อยู่"
        value={detailValue}
        onChange={(e) => detailOnChange(e.target.value)}
        status={detailError ? "error" : undefined}
        className="input"
        disabled={disabled}
      />
      {detailError && <p className="text-red-500 text-sm">{detailError}</p>}
      <br />
      <br />

      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <Select
          size="large"
          status={errors.province ? "error" : undefined}
          options={location.provinces.map((p) => ({ value: p.id, label: p.name }))}
          value={location.selectedProvince ?? undefined}
          onChange={(value) => location.setSelectedProvince(value ?? null)}
          placeholder="จังหวัด"
          className="select-input"
          allowClear
          disabled={disabled}
        />

        <Select
          size="large"
          status={errors.district ? "error" : undefined}
          options={location.districts.map((d) => ({ value: d.id, label: d.name }))}
          value={location.selectedDistrict ?? undefined}
          onChange={(value) => location.setSelectedDistrict(value ?? null)}
          placeholder="เขต/อำเภอ"
          className="select-input"
          allowClear
          disabled={disabled || !location.selectedProvince}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <Select
          size="large"
          status={errors.subDistrict ? "error" : undefined}
          options={location.subDistricts.map((s) => ({ value: s.id, label: s.name }))}
          value={location.selectedSubDistrict ?? undefined}
          onChange={(value) => location.setSelectedSubDistrict(value ?? null)}
          placeholder="แขวง/ตำบล"
          className="select-input"
          allowClear
          disabled={disabled || !location.selectedDistrict}
        />

        <Select
          size="large"
          status={errors.zipCode ? "error" : undefined}
          options={location.zipCodes.map((z) => ({ value: z.id, label: z.name }))}
          value={location.selectedZipCode ?? undefined}
          onChange={(value) => location.setSelectedZipCode(value ?? null)}
          placeholder="รหัสไปรษณีย์"
          className="select-input"
          allowClear
          disabled={disabled || !location.selectedSubDistrict}
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
  submitLoading,
  registerLoading,
  successMessage,
  current,
  nation,
}: RegisterStep2Props) {
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);

  useEffect(() => {
    if (!sameAsCurrentAddress) {
      return;
    }

    setForm((prev) =>
      prev.detailNation === form.detail
        ? prev
        : {
            ...prev,
            detailNation: form.detail,
          },
    );

    const timers = [
      setTimeout(() => nation.setSelectedProvince(current.selectedProvince), 0),
      setTimeout(() => nation.setSelectedDistrict(current.selectedDistrict), 100),
      setTimeout(() => nation.setSelectedSubDistrict(current.selectedSubDistrict), 200),
      setTimeout(() => nation.setSelectedZipCode(current.selectedZipCode), 300),
    ];

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [
    current.selectedDistrict,
    current.selectedProvince,
    current.selectedSubDistrict,
    current.selectedZipCode,
    form.detail,
    nation.setSelectedDistrict,
    nation.setSelectedProvince,
    nation.setSelectedSubDistrict,
    nation.setSelectedZipCode,
    sameAsCurrentAddress,
    setForm,
  ]);

  const isStepComplete =
    !!form.title &&
    form.name.trim().length > 0 &&
    form.surName.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.password.length > 0 &&
    form.confirmPassword.length > 0 &&
    form.phone.trim().length > 0 &&
    form.medicalCondition.trim().length > 0 &&
    form.allergyDrug.trim().length > 0 &&
    form.detail.trim().length > 0 &&
    form.detailNation.trim().length > 0 &&
    current.selectedProvince !== null &&
    current.selectedDistrict !== null &&
    current.selectedSubDistrict !== null &&
    current.selectedZipCode !== null &&
    nation.selectedProvince !== null &&
    nation.selectedDistrict !== null &&
    nation.selectedSubDistrict !== null &&
    nation.selectedZipCode !== null;

  return (
    <div className={`${styles.registerStep2} space-y-10`}>
      <div className="space-y-8">
        <div className="grid grid-cols-[1fr_2fr_2fr] gap-x-6 gap-y-6">
          <div>
            <Label text="คำนำหน้า" />

            <Select
              size="large"
              value={form.title ?? undefined}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  title: value ?? null,
                }))
              }
              status={errors.title ? "error" : undefined}
              className="select-input"
              options={titles.map((t) => ({ value: t, label: t }))}
              allowClear
            />

            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label text="ชื่อ" />

            <Input
              size="large"
              placeholder="ชื่อ"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ""),
                }))
              }
              status={errors.name ? "error" : undefined}
              className="input"
            />

            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label text="นามสกุล" />

            <Input
              size="large"
              placeholder="นามสกุล"
              value={form.surName}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  surName: e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ""),
                }))
              }
              status={errors.surName ? "error" : undefined}
              className="input"
            />

            {errors.surName && <p className="text-red-500 text-sm mt-1">{errors.surName}</p>}
          </div>
        </div>

        <Label text="Email" />
        <Input
          size="large"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          status={errors.email ? "error" : undefined}
          className="input"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        <br />
        <br />

        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <Label text="รหัสผ่าน" />
            <Input.Password
              size="large"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              status={errors.password ? "error" : undefined}
              className="input"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <div>
            <Label text="ยืนยันรหัสผ่าน" />
            <Input.Password
              size="large"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              status={errors.confirmPassword ? "error" : undefined}
              className="input"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-4 gap-y-6">
          <div>
            <Label text="เบอร์โทรศัพท์" />
            <Input
              size="large"
              value={form.phone}
              pattern="[0-9]*"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  phone: formatPhoneNumber(e.target.value),
                }))
              }
              status={errors.phone ? "error" : undefined}
              className="input"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <Label text="โรคประจำตัว" />
            <Input
              size="large"
              placeholder="ถ้าไม่มีให้ใส่ -"
              value={form.medicalCondition}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  medicalCondition: e.target.value,
                }))
              }
              status={errors.medicalCondition ? "error" : undefined}
              className="input"
            />
            {errors.medicalCondition && (
              <p className="text-red-500 text-sm">{errors.medicalCondition}</p>
            )}
          </div>

          <div>
            <Label text="แพ้ยา" />
            <Input
              size="large"
              placeholder="ถ้าไม่มีให้ใส่ -"
              value={form.allergyDrug}
              onChange={(e) => setForm((prev) => ({ ...prev, allergyDrug: e.target.value }))}
              status={errors.allergyDrug ? "error" : undefined}
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

      <div className="pt-1">
        <Checkbox
          checked={sameAsCurrentAddress}
          onChange={(e) => setSameAsCurrentAddress(e.target.checked)}
        >
          ที่อยู่ตามบัตรเหมือนที่อยู่ปัจจุบัน
        </Checkbox>
      </div>

      <AddressSection
        title="ที่อยู่ตามทะเบียน *"
        detailValue={form.detailNation}
        detailError={errors.detailNation}
        detailOnChange={(value) => setForm((prev) => ({ ...prev, detailNation: value }))}
        location={nation}
        disabled={sameAsCurrentAddress}
        errors={{
          province: errors.nationProvince,
          district: errors.nationDistrict,
          subDistrict: errors.nationSubDistrict,
          zipCode: errors.nationZipCode,
        }}
      />

      <Button
        type="primary"
        size="large"
        onClick={handleSubmit}
        disabled={!isStepComplete}
        loading={submitLoading || registerLoading}
        className="btn-primary"
      >
        {submitLoading || registerLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
      </Button>

      {successMessage && <p className="text-green-600 text-center text-sm">{successMessage}</p>}
    </div>
  );
}
