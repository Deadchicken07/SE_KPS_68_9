"use client";

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
      <h3 className="text-xl font-semibold text-[#2F6E5D]">ยืนยัน OTP</h3>

      <p className="text-gray-500 text-sm">
        กรุณากรอกรหัส OTP ที่ส่งไปยัง
        <br />
        <span className="font-medium text-gray-700">{email}</span>
      </p>

      <OtpInput value={otp} onChange={setOtp} />

      {otpError && <p className="text-red-500 text-sm">{otpError}</p>}

      <button
        disabled={verifyOtpLoading || registering || otp.length !== 6}
        onClick={handleVerify}
        className="btn-primary"
      >
        {verifyOtpLoading ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
      </button>

      <p
        onClick={handleResend}
        className={`text-sm ${
          cooldown > 0
            ? "text-gray-400"
            : "text-blue-600 btn-primary-pointer hover:underline"
        }`}
      >
        {cooldown > 0
          ? `ขอ OTP ใหม่ใน ${cooldown}s`
          : sendOtpLoading
            ? "กำลังส่ง OTP..."
            : "ขอ OTP ใหม่"}
      </p>
    </div>
  );
}
