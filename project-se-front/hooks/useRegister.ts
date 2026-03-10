import { useState } from "react";
import axios from "axios";
import { RegisterPayload } from "@/types/Register.types";

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const API = "http://localhost:4000/auth/register";

  const register = async (data: RegisterPayload) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await axios.post(API, data, {
        timeout: 25000,
      });

      setSuccess(true);
      return true;
    } catch (err: unknown) {
      let message = "Something went wrong";

      if (axios.isAxiosError<{ message?: string | string[] }>(err)) {
        if (err.code === 'ECONNABORTED') {
          message = 'คำขอใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง';
        }

        const resMessage = err.response?.data?.message;

        if (Array.isArray(resMessage)) {
          message = resMessage.join(", ");
        } else if (resMessage) {
          message = resMessage;
        }
      }

      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error,
    success,
  };
};