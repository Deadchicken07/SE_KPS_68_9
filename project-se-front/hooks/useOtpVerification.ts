import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export const useOtpVerification = () => {
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0); // เวลานับถอยหลัง resend

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const sendOtp = async (email: string) => {
    try {
      setSendOtpLoading(true);
      setError(null);

      await axios.post(`${API}/mail/send-otp`, { email });

      // เริ่ม cooldown 120 วินาที (ตาม backend OTP)
      setCooldown(120);

      return true;
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ไม่สามารถส่ง OTP ได้",
      );
      return false;
    } finally {
      setSendOtpLoading(false);
    }
  };

  const verifyOtp = async (email: string, code: string) => {
    try {
      setVerifyOtpLoading(true);
      setError(null);

      const res = await axios.post(`${API}/mail/verify-otp`, {
        email,
        code,
      });

      await new Promise((r) => setTimeout(r, 600));
      if (res.data.message === "OTP verified") {
        return true;
      }

      setError(res.data.message);
      return false;
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "OTP ไม่ถูกต้อง",
      );
      return false;
    } finally {
      setVerifyOtpLoading(false);
    }
  };

  return {
    sendOtp,
    verifyOtp,
    sendOtpLoading,
    verifyOtpLoading,
    cooldown,
    error,
  };
};
