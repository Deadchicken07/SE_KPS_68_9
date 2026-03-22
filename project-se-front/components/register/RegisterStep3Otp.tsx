"use client";

import { Button } from "antd";
import OtpInput from "@/components/OtpInput";
import { RegisterStep3Props } from "@/types/Register.types";

export default function RegisterStep3Otp({
  otp,
  setOtp,
  verifyOtp,
  verifyOtpLoading,
  sendOtp,
  sendOtpLoading,
  cooldown,
  otpError,
  registering,
  registerUser,
  email,
}: RegisterStep3Props) {
  const handleVerify = async () => {
    const ok = await verifyOtp(email, otp);

    if (ok) {
      await registerUser();
    }
  };

  const handleResend = () => {
    if (cooldown === 0 && !sendOtpLoading) {
      sendOtp(email);
      setOtp("");
    }
  };

  return (
    <div className="space-y-6 text-center">
      <h3 className="text-xl font-semibold text-[#0e5b50]">ยืนยัน OTP</h3>

      <p className="text-gray-500 text-sm">
        กรุณากรอกรหัส OTP ที่ส่งไปยัง
        <br />
        <span className="font-medium text-gray-700">{email}</span>
      </p>

      <OtpInput value={otp} onChange={setOtp} />

      {otpError && <p className="text-red-500 text-sm">{otpError}</p>}

      <Button
        type="primary"
        size="large"
        disabled={registering || otp.length !== 6}
        loading={verifyOtpLoading}
        onClick={handleVerify}
        className="btn-primary"
      >
        {verifyOtpLoading ? "กำลังตรวจสอบ OTP..." : "ยืนยัน OTP"}
      </Button>

      <p
        onClick={handleResend}
        className={`text-sm ${
          cooldown > 0
            ? "text-gray-400"
            : "text-[#0e5b50] btn-primary-pointer hover:underline"
        }`}
      >
        {cooldown > 0
          ? `ส่ง OTP ใหม่ใน ${cooldown}s`
          : sendOtpLoading
            ? "กำลังส่ง OTP..."
            : "ส่ง OTP ใหม่"}
      </p>
    </div>
  );
}
