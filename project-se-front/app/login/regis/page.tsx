"use client";

import { useNationCheck } from "@/hooks/useNationCheck";
import { useRegister } from "@/hooks/useRegister";
import { useLocationDropdown } from "@/hooks/useLocationDropdown";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select, { StylesConfig } from "react-select";

type FormErrors = {
  nationId?: string;
  email?: string;
  name?: string;
  surName?: string;
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
type SelectOption = {
  value: number;
  label: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { checkNation, loading: nationLoading } = useNationCheck();
  const { register, loading: registerLoading, error, success } = useRegister();

  const current = useLocationDropdown();
  const nation = useLocationDropdown();

  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    nationId: "",
    email: "",
    name: "",
    surName: "",
    password: "",
    confirmPassword: "",
    phone: "",
    medicalCondition: "",
    allergyDrug: "",
    detail: "",
    detailNation: "",
  });

  useEffect(() => {
    if (error) {
      const newErrors: FormErrors = {};

      if (error.toLowerCase().includes("email")) {
        newErrors.email = "Email นี้ถูกใช้งานแล้ว";
      }

      if (error.toLowerCase().includes("nation")) {
        newErrors.nationId = "เลขบัตรประชาชนนี้ถูกใช้งานแล้ว";
      }

      setErrors((prev) => ({ ...prev, ...newErrors }));
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      setSuccessMessage("สมัครสมาชิกสำเร็จ 🎉");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
  }, [success, router]);

  const handleNationCheck = async () => {
    if (!/^\d{13}$/.test(form.nationId)) {
      setErrors({ nationId: "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก" });
      return;
    }

    const result = await checkNation(form.nationId);

    if (result.status === "not_found") {
      setErrors({});
      setStep(2);
      return;
    }

    if (result.status === "completed") {
      setErrors({ nationId: "บัญชีนี้สมัครแล้ว กรุณาเข้าสู่ระบบ" });
      return;
    }

    if (result.status === "incomplete") {
      const data = result.data;

      setForm((prev) => ({
        ...prev,
        name: data.name || "",
        surName: data.surName || "",
        phone: data.phone || "",
        email: "",
      }));

      if (data.currentAddress) {
        current.setSelectedProvince(data.currentAddress.provinceId ?? null);
        current.setSelectedDistrict(data.currentAddress.districtId ?? null);
        current.setSelectedSubDistrict(
          data.currentAddress.subDistrictId ?? null,
        );
      }

      if (data.nationAddress) {
        nation.setSelectedProvince(data.nationAddress.provinceId ?? null);
        nation.setSelectedDistrict(data.nationAddress.districtId ?? null);
        nation.setSelectedSubDistrict(data.nationAddress.subDistrictId ?? null);
      }

      setErrors({});
      setStep(2);
    }
  };
  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    if (!form.email) newErrors.email = "กรุณากรอก Email";
    if (!form.name) newErrors.name = "กรุณากรอกชื่อ";
    if (!form.surName) newErrors.surName = "กรุณากรอกนามสกุล";
    if (!form.password) newErrors.password = "กรุณากรอกรหัสผ่าน";

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }
    if (!form.detailNation) newErrors.detailNation = "กรุณากรอกรายละเอียด";
    if (!form.detail) newErrors.detail = "กรุณากรอกรายละเอียด";

    if (current.selectedProvince === null)
      newErrors.currentProvince = "กรุณาเลือกจังหวัด";
    if (current.selectedDistrict === null)
      newErrors.currentDistrict = "กรุณาเลือกอำเภอ";
    if (current.selectedSubDistrict === null)
      newErrors.currentSubDistrict = "กรุณาเลือกตำบล";
    if (current.selectedZipCode === null)
      newErrors.currentZipCode = "กรุณาเลือกรหัสไปรษณีย์";

    if (nation.selectedProvince === null)
      newErrors.nationProvince = "กรุณาเลือกจังหวัด";
    if (nation.selectedDistrict === null)
      newErrors.nationDistrict = "กรุณาเลือกอำเภอ";
    if (nation.selectedSubDistrict === null)
      newErrors.nationSubDistrict = "กรุณาเลือกตำบล";
    if (nation.selectedZipCode === null)
      newErrors.nationZipCode = "กรุณาเลือกรหัสไปรษณีย์";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await register({
      email: form.email,
      name: form.name,
      surName: form.surName,
      password: form.password,
      phone: form.phone || undefined,
      nationId: form.nationId || undefined,
      medicalCondition: form.medicalCondition || undefined,
      allergyDrug: form.allergyDrug || undefined,
      address: {
        provinceId: current.selectedProvince!,
        districtId: current.selectedDistrict!,
        subDistrictId: current.selectedSubDistrict!,
        detail: form.detail,
        zipCodeId: current.selectedZipCode!,
      },
      addressNation: {
        provinceId: nation.selectedProvince!,
        districtId: nation.selectedDistrict!,
        subDistrictId: nation.selectedSubDistrict!,
        detail: form.detailNation,
        zipCodeId: nation.selectedZipCode!,
      },
    });
  };

  const selectStyle: StylesConfig<SelectOption, false> = {
    control: (base) => ({
      ...base,
      borderRadius: "12px",
      borderColor: "#3F7F6D",
      boxShadow: "none",
      "&:hover": { borderColor: "#2F6E5D" },
    }),
  };

  const Label = ({ text }: { text: string }) => (
    <label className="text-sm font-medium text-gray-600">
      {text} <span className="text-red-500">*</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8EAD9] to-[#DDE3CF] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-3xl bg-white rounded-[28px] p-16 shadow-xl space-y-12">
        <h2 className="text-4xl font-bold text-[#2F6E5D] text-center">
          สมัครสมาชิก
        </h2>

        {step === 1 && (
          <div className="space-y-6">
            <Label text="เลขบัตรประชาชน" />
            <input
              value={form.nationId}
              onChange={(e) => setForm({ ...form, nationId: e.target.value })}
              className={`input ${errors.nationId ? "border-red-500" : ""}`}
            />
            {errors.nationId && (
              <p className="text-red-500 text-sm">{errors.nationId}</p>
            )}

            <button
              onClick={handleNationCheck}
              disabled={nationLoading}
              className="btn-primary"
            >
              {nationLoading ? "กำลังตรวจสอบ..." : "ตรวจสอบ"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label text="ชื่อ" />
                  <input
                    placeholder="ชื่อ"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`input ${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label text="นามสกุล" />
                  <input
                    placeholder="นามสกุล"
                    value={form.surName}
                    onChange={(e) =>
                      setForm({ ...form, surName: e.target.value })
                    }
                    className={`input ${errors.surName ? "border-red-500" : ""}`}
                  />
                  {errors.surName && (
                    <p className="text-red-500 text-sm">{errors.surName}</p>
                  )}
                </div>
              </div>
              <Label text="Email" />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`input ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label text="รหัสผ่าน" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className={`input ${errors.password ? "border-red-500" : ""}`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>

                <div>
                  <Label text="ยืนยันรหัสผ่าน" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    className={`input ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label text="เบอร์โทร" />
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="input"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label text="โรคประจำตัว" />
                  <input
                    placeholder="ถ้าไม่มีให้ใส่ -"
                    value={form.medicalCondition}
                    onChange={(e) =>
                      setForm({ ...form, medicalCondition: e.target.value })
                    }
                    className="input"
                  />
                </div>

                <div>
                  <Label text="แพ้ยา" />
                  <input
                    placeholder="ถ้าไม่มีให้ใส่ -"
                    value={form.allergyDrug}
                    onChange={(e) =>
                      setForm({ ...form, allergyDrug: e.target.value })
                    }
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#2F6E5D]">
                ที่อยู่ปัจจุบัน *
              </h4>

              <input
                placeholder="รายละเอียดที่อยู่"
                value={form.detail}
                onChange={(e) => setForm({ ...form, detail: e.target.value })}
                className="input"
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  styles={selectStyle}
                  options={current.provinces.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  value={
                    current.provinces
                      .map((p) => ({ value: p.id, label: p.name }))
                      .find((o) => o.value === current.selectedProvince) || null
                  }
                  onChange={(o) =>
                    current.setSelectedProvince(o ? o.value : null)
                  }
                  placeholder="เลือกจังหวัด"
                />

                <Select
                  styles={selectStyle}
                  options={current.districts.map((d) => ({
                    value: d.id,
                    label: d.name,
                  }))}
                  value={
                    current.districts
                      .map((d) => ({ value: d.id, label: d.name }))
                      .find((o) => o.value === current.selectedDistrict) || null
                  }
                  onChange={(o) =>
                    current.setSelectedDistrict(o ? o.value : null)
                  }
                  placeholder="เลือกอำเภอ"
                  isDisabled={!current.selectedProvince}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  styles={selectStyle}
                  options={current.subDistricts.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  value={
                    current.subDistricts
                      .map((s) => ({ value: s.id, label: s.name }))
                      .find((o) => o.value === current.selectedSubDistrict) ||
                    null
                  }
                  onChange={(o) =>
                    current.setSelectedSubDistrict(o ? o.value : null)
                  }
                  placeholder="เลือกตำบล"
                  isDisabled={!current.selectedDistrict}
                />

                <Select
                  styles={selectStyle}
                  options={current.zipCodes.map((z) => ({
                    value: z.id,
                    label: z.name,
                  }))}
                  value={
                    current.zipCodes
                      .map((z) => ({ value: z.id, label: z.name }))
                      .find((o) => o.value === current.selectedZipCode) || null
                  }
                  onChange={(o) =>
                    current.setSelectedZipCode(o ? o.value : null)
                  }
                  placeholder="เลือกรหัสไปรษณีย์"
                  isDisabled={!current.selectedSubDistrict}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#2F6E5D]">
                ที่อยู่ตามบัตรประชาชน *
              </h4>

              <input
                placeholder="รายละเอียดที่อยู่"
                value={form.detailNation}
                onChange={(e) =>
                  setForm({ ...form, detailNation: e.target.value })
                }
                className="input"
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  styles={selectStyle}
                  options={nation.provinces.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  value={
                    nation.provinces
                      .map((p) => ({ value: p.id, label: p.name }))
                      .find((o) => o.value === nation.selectedProvince) || null
                  }
                  onChange={(o) =>
                    nation.setSelectedProvince(o ? o.value : null)
                  }
                  placeholder="เลือกจังหวัด"
                />

                <Select
                  styles={selectStyle}
                  options={nation.districts.map((d) => ({
                    value: d.id,
                    label: d.name,
                  }))}
                  value={
                    nation.districts
                      .map((d) => ({ value: d.id, label: d.name }))
                      .find((o) => o.value === nation.selectedDistrict) || null
                  }
                  onChange={(o) =>
                    nation.setSelectedDistrict(o ? o.value : null)
                  }
                  placeholder="เลือกอำเภอ"
                  isDisabled={!nation.selectedProvince}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  styles={selectStyle}
                  options={nation.subDistricts.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  value={
                    nation.subDistricts
                      .map((s) => ({ value: s.id, label: s.name }))
                      .find((o) => o.value === nation.selectedSubDistrict) ||
                    null
                  }
                  onChange={(o) =>
                    nation.setSelectedSubDistrict(o ? o.value : null)
                  }
                  placeholder="เลือกตำบล"
                  isDisabled={!nation.selectedDistrict}
                />

                <Select
                  styles={selectStyle}
                  options={nation.zipCodes.map((z) => ({
                    value: z.id,
                    label: z.name,
                  }))}
                  value={
                    nation.zipCodes
                      .map((z) => ({ value: z.id, label: z.name }))
                      .find((o) => o.value === nation.selectedZipCode) || null
                  }
                  onChange={(o) =>
                    nation.setSelectedZipCode(o ? o.value : null)
                  }
                  placeholder="เลือกรหัสไปรษณีย์"
                  isDisabled={!nation.selectedSubDistrict}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={registerLoading}
              className="btn-primary"
            >
              {registerLoading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
            </button>

            {successMessage && (
              <p className="text-green-600 text-center text-sm">
                {successMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
