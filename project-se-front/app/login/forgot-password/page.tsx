"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import OtpInput from "@/components/OtpInput";
import { useOtpVerification } from "@/hooks/useOtpVerification";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const {
    sendOtp,
    verifyOtp,
    sendOtpLoading,
    verifyOtpLoading,
    cooldown,
    error: otpError,
  } = useOtpVerification();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSendOtp = async () => {
    setError(null);
    if (!email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }

    const ok = await sendOtp(email);
    if (ok) {
      setStep(2);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (otp.length !== 6) {
      setError("กรุณากรอก OTP 6 หลัก");
      return;
    }

    const ok = await verifyOtp(email, otp);
    if (ok) {
      setStep(3);
    }
  };

  const handleResetPassword = async () => {
    setError(null);

    if (!newPassword) {
      setError("กรุณากรอกรหัสผ่านใหม่");
      return;
    }

    if (newPassword.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:4000/auth/reset-password", {
        email,
        newPassword,
      });

      setSuccessMessage("เปลี่ยนรหัสผ่านสำเร็จ");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8EAD9] to-[#DDE3CF] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl bg-white rounded-[28px] p-12 shadow-xl space-y-8">
        <h2 className="text-3xl font-bold text-[#2F6E5D] text-center">ลืมรหัสผ่าน</h2>

        {step === 1 && (
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-600">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="example@email.com"
            />
            <button
              onClick={handleSendOtp}
              disabled={sendOtpLoading}
              className="btn-primary w-full"
            >
              {sendOtpLoading ? "กำลังส่ง OTP..." : "ส่ง OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 text-center">
            <p className="text-sm text-gray-600">
              กรอกรหัส OTP ที่ส่งไปยัง
              <br />
              <span className="font-medium text-gray-800">{email}</span>
            </p>

            <OtpInput value={otp} onChange={setOtp} />

            <button
              onClick={handleVerifyOtp}
              disabled={verifyOtpLoading || otp.length !== 6}
              className="btn-primary w-full"
            >
              {verifyOtpLoading ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
            </button>

            <p
              onClick={async () => {
                if (cooldown === 0 && !sendOtpLoading) {
                  await sendOtp(email);
                  setOtp("");
                }
              }}
              className={`text-sm ${
                cooldown > 0
                  ? "text-gray-400"
                  : "text-blue-600 cursor-pointer hover:underline"
              }`}
            >
              {cooldown > 0
                ? `ขอ OTP ใหม่ใน ${cooldown}s`
                : sendOtpLoading
                  ? "กำลังส่ง OTP..."
                  : "ขอ OTP ใหม่"}
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">รหัสผ่านใหม่</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
              />
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
            </button>
          </div>
        )}

        {(error || otpError) && (
          <p className="text-sm text-red-500 text-center">{error || otpError}</p>
        )}

        {successMessage && <p className="text-sm text-green-600 text-center">{successMessage}</p>}

        <div className="text-center text-sm">
          <span
            onClick={() => router.push("/login")}
            className="text-[#2F6E5D] hover:underline cursor-pointer"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </span>
        </div>
      </div>
    </div>
  );
}
