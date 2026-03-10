"use client";

import {  useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Flex, Layout, notification, Typography } from "antd";
import axios from "axios";
import { useNationCheck } from "@/hooks/useNationCheck";
import { useRegister } from "@/hooks/useRegister";
import { useLocationDropdown } from "@/hooks/useLocationDropdown";
import { useOtpVerification } from "@/hooks/useOtpVerification";
import type { FormErrors, RegisterForm } from "@/types/Register.types";
import RegisterStep1Nation from "@/components/register/RegisterStep1Nation";
import RegisterStep2Form from "@/components/register/RegisterStep2Form";
import RegisterStep3Otp from "@/components/register/RegisterStep3Otp";
import { backButtonStyle, cardStyle, orbBaseStyle, shellStyle } from "@/style/regis.styles";


const titles = ["เด็กชาย", "เด็กหญิง", "นาย", "นาง", "นางสาว"];

export default function RegisterPage() {
  const router = useRouter();
  const { checkNation, loading: nationLoading } = useNationCheck();
  const { register, loading: registerLoading, error, success } = useRegister();

  const current = useLocationDropdown();
  const nation = useLocationDropdown();

  const {
    sendOtp,
    verifyOtp,
    sendOtpLoading,
    verifyOtpLoading,
    cooldown,
    error: otpError,
  } = useOtpVerification();

  const [registering, setRegistering] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
 const [api, contextHolder] = notification.useNotification();
  const [form, setForm] = useState<RegisterForm>({
    nationId: "",
    email: "",
    name: "",
    surName: "",
    password: "",
    title: null,
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
      setSuccessMessage("สมัครสมาชิกสำเร็จ");
      setTimeout(() => {
        router.push("/login?registered=success");
      }, 1500);
    }
  }, [success, router]);

  const handleNationCheck = async () => {
    const newErrors: FormErrors = {};

    if (!/^\d{13}$/.test(form.nationId)) {
      newErrors.nationId = "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก";
    }

    if (!form.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อ";
    }

    if (!form.surName.trim()) {
      newErrors.surName = "กรุณากรอกนามสกุล";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await checkNation(form.nationId, form.name, form.surName);

    if (result.status === "new") {
      setForm((prev) => ({
        ...prev,
        name: form.name,
        surName: form.surName,
        nationId: form.nationId,
      }));

      setErrors({});
      setStep(2);
      return;
    }

    if (result.status === "mismatch") {
      setErrors({
        nationId: "เลขบัตรประชาชน ชื่อ หรือ นามสกุล ไม่ถูกต้อง",
      });
      return;
    }

    if (result.status === "completed") {
      setErrors({
        nationId: "บัญชีนี้สมัครแล้ว กรุณาเข้าสู่ระบบ",
      });
      return;
    }

    if (result.status === "incomplete") {
      const data = result.data;

      setForm((prev) => ({
        ...prev,
        name: data.name || "",
        surName: data.surName || "",
        title: data.title || "",
        phone: data.phone || "",
        email: "",
        medicalCondition: data.medicalCondition || "",
        allergyDrug: data.allergyDrug || "",
      }));

      if (data.currentAddress) {
        const addr = data.currentAddress;

        setTimeout(() => current.setSelectedProvince(addr.provinceId ?? null), 100);
        setTimeout(() => current.setSelectedDistrict(addr.districtId ?? null), 200);
        setTimeout(() => current.setSelectedSubDistrict(addr.subDistrictId ?? null), 300);
        setTimeout(() => current.setSelectedZipCode(addr.zipCodeId ?? null), 400);

        setForm((prev) => ({
          ...prev,
          detail: addr.detail || "",
        }));
      }

      if (data.nationAddress) {
        const addr = data.nationAddress;
        setTimeout(() => nation.setSelectedProvince(addr.provinceId ?? null), 100);
        setTimeout(() => nation.setSelectedDistrict(addr.districtId ?? null), 200);
        setTimeout(() => nation.setSelectedSubDistrict(addr.subDistrictId ?? null), 300);
        setTimeout(() => nation.setSelectedZipCode(addr.zipCodeId ?? null), 400);
        setForm((prev) => ({
          ...prev,
          detailNation: addr.detail || "",
        }));
      }

      setErrors({});
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};
    const res = await axios.post("http://localhost:4000/users/check-email", {
      email: form.email,
    });

    if (res.data.exists) {
      setErrors({ email: "Email นี้ถูกใช้งานแล้ว" });
      return;
    }

    if (!form.email) newErrors.email = "กรุณากรอก Email";
    if (!form.name) newErrors.name = "กรุณากรอกชื่อ";
    if (!form.surName) newErrors.surName = "กรุณากรอกนามสกุล";
    if (!form.password) newErrors.password = "กรุณากรอกรหัสผ่าน";
    if (!form.title) newErrors.title = "กรุณาเลือกคำนำหน้า";
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }
    if (!form.detailNation) newErrors.detailNation = "กรุณากรอกรายละเอียด";
    if (!form.detail) newErrors.detail = "กรุณากรอกรายละเอียด";
    if (!form.phone) newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
    if (!form.allergyDrug) newErrors.allergyDrug = "กรุณากรอกยาที่แพ้";
    if (!form.medicalCondition) {
      newErrors.medicalCondition = "กรุณากรอกรายละเอียดโรคประจำตัว";
    }

    if (current.selectedProvince === null) newErrors.currentProvince = "กรุณาเลือกจังหวัด";
    if (current.selectedDistrict === null) newErrors.currentDistrict = "กรุณาเลือกอำเภอ";
    if (current.selectedSubDistrict === null) newErrors.currentSubDistrict = "กรุณาเลือกตำบล";
    if (current.selectedZipCode === null) newErrors.currentZipCode = "กรุณาเลือกรหัสไปรษณีย์";

    if (nation.selectedProvince === null) newErrors.nationProvince = "กรุณาเลือกจังหวัด";
    if (nation.selectedDistrict === null) newErrors.nationDistrict = "กรุณาเลือกอำเภอ";
    if (nation.selectedSubDistrict === null) newErrors.nationSubDistrict = "กรุณาเลือกตำบล";
    if (nation.selectedZipCode === null) newErrors.nationZipCode = "กรุณาเลือกรหัสไปรษณีย์";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const otpSent = await sendOtp(form.email);
    if (otpSent) {
      setStep(3);
    }
  };

  const registerUser = async () => {
    if (registering) return;

    setRegistering(true);

    const registered = await register({
      email: form.email,
      name: form.name,
      surName: form.surName,
      password: form.password,
      title: form.title,
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
    if (!registered) {
      setRegistering(false);
    }
  };

  return (
     <>
     {contextHolder}
    <Layout style={shellStyle}>
      <div
        style={{
          ...orbBaseStyle,
          top: -120,
          left: -120,
          width: 260,
          height: 260,
          background: "rgba(14, 91, 80, 0.20)",
        }}
      />
      <div
        style={{
          ...orbBaseStyle,
          right: -120,
          bottom: -140,
          width: 320,
          height: 320,
          background: "rgba(192, 144, 87, 0.20)",
        }}
      />

      <Flex align="center" justify="center" style={{ minHeight: "100%" }}>
        <Card variant="borderless" styles={{ body: { padding: 40 } }} style={cardStyle}>
          <Flex justify="space-between" align="center" gap={12} wrap style={{ marginBottom: 32 }}>
            <div>
              <Typography.Text
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "rgba(14, 91, 80, 0.75)",
                }}
              >
                Create account
              </Typography.Text>
              <Typography.Title
                level={2}
                style={{ marginTop: 8, marginBottom: 0, color: "#0f172a" }}
              >
                สมัครสมาชิก
              </Typography.Title>
            </div>

            <Button onClick={() => router.push("/login")} size="large" style={backButtonStyle}>
              กลับหน้าเข้าสู่ระบบ
            </Button>
          </Flex>

          {otpError && <Alert style={{ marginBottom: 24 }} type="error" title={otpError} showIcon />}

          {step === 1 && (
            <RegisterStep1Nation
              form={form}
              errors={errors}
              setForm={setForm}
              handleNationCheck={handleNationCheck}
              nationLoading={nationLoading}
            />
          )}

          {step === 2 && (
            <RegisterStep2Form
              form={form}
              errors={errors}
              setForm={setForm}
              titles={titles}
              handleSubmit={handleSubmit}
              sendOtpLoading={sendOtpLoading}
              registerLoading={registerLoading}
              successMessage={successMessage}
              current={current}
              nation={nation}
            />
          )}

          {step === 3 && (
            <RegisterStep3Otp
              otp={otp}
              setOtp={setOtp}
              verifyOtp={verifyOtp}
              verifyOtpLoading={verifyOtpLoading}
              sendOtp={sendOtp}
              sendOtpLoading={sendOtpLoading}
              cooldown={cooldown}
              otpError={otpError || undefined}
              registering={registering}
              registerUser={registerUser}
              email={form.email}
            />
          )}
        </Card>
      </Flex>
    </Layout>
    </>
  );
}
