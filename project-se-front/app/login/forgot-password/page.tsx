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
    if (ok) setStep(2);
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (otp.length !== 6) {
      setError("กรุณากรอก OTP 6 หลัก");
      return;
    }

    const ok = await verifyOtp(email, otp);
    if (ok) setStep(3);
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
      setTimeout(() => router.push("/login"), 1200);
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
    <main className="auth-shell flex items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
      <div className="auth-orb top-[-120px] left-[-120px] h-[260px] w-[260px] bg-[#2f6e5d]/30" />
      <div className="auth-orb alt bottom-[-140px] right-[-120px] h-[320px] w-[320px] bg-[#4e987f]/30" />

      <section className="auth-card w-full max-w-xl p-8 sm:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#3f7f6d]/75">Account recovery</p>
        <h2 className="mt-2 text-3xl font-semibold text-[#1d493d]">ลืมรหัสผ่าน</h2>

        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className={`rounded-full px-3 py-1 ${step >= 1 ? "bg-[#2f6e5d] text-white" : "bg-slate-200"}`}>1</span>
          <span className={`rounded-full px-3 py-1 ${step >= 2 ? "bg-[#2f6e5d] text-white" : "bg-slate-200"}`}>2</span>
          <span className={`rounded-full px-3 py-1 ${step >= 3 ? "bg-[#2f6e5d] text-white" : "bg-slate-200"}`}>3</span>
        </div>

        {step === 1 && (
          <div className="mt-6 space-y-4">
            <label className="text-sm font-medium text-slate-600">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="example@email.com"
            />
            <button onClick={handleSendOtp} disabled={sendOtpLoading} className="btn-primary">
              {sendOtpLoading ? "กำลังส่ง OTP..." : "ส่ง OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-5 text-center">
            <p className="text-sm text-slate-600">
              กรอกรหัส OTP ที่ส่งไปยัง
              <br />
              <span className="font-medium text-slate-800">{email}</span>
            </p>

            <OtpInput value={otp} onChange={setOtp} />

            <button
              onClick={handleVerifyOtp}
              disabled={verifyOtpLoading || otp.length !== 6}
              className="btn-primary"
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
                  ? "cursor-not-allowed text-slate-400"
                  : "cursor-pointer text-[#2f6e5d] hover:underline"
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
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">รหัสผ่านใหม่</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input mt-2"
              />
            </div>

            <button onClick={handleResetPassword} disabled={loading} className="btn-primary">
              {loading ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
            </button>
          </div>
        )}

        {(error || otpError) && <p className="mt-5 text-center text-sm text-red-500">{error || otpError}</p>}
        {successMessage && <p className="mt-5 text-center text-sm text-green-600">{successMessage}</p>}

        <div className="mt-6 text-center text-sm">
          <span
            onClick={() => router.push("/login")}
            className="cursor-pointer font-medium text-[#2f6e5d] hover:underline"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </span>
        </div>
      </section>
    </main>
  );
}

