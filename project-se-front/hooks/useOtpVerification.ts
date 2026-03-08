import { useState } from "react";
import axios from "axios";

const API = "http://localhost:4000";

export const useOtpVerification = () => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendOtp = async (email: string) => {

    try {

      setLoading(true);
      setError(null);

      await axios.post(`${API}/mail/send-otp`, {
        email,
      });

      return true;

    } catch (err) {

      setError("ไม่สามารถส่ง OTP ได้");
      return false;

    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, code: string) => {

    try {

      setLoading(true);
      setError(null);

      const res = await axios.post(`${API}/mail/verify-otp`, {
        email,
        code,
      });

      if (res.data.message === "OTP verified") {

        setSuccess(true);
        return true;

      }

      setError(res.data.message);
      return false;

    } catch (err) {

      setError("OTP ไม่ถูกต้อง");
      return false;

    } finally {

      setLoading(false);

    }
  };

  return {
    sendOtp,
    verifyOtp,
    loading,
    error,
    success,
  };
};