import { useState } from 'react';
import axios from 'axios';

interface RegisterPayload {
  email: string;
  name: string;
  surName: string;
  password: string;
  phone?: string;
  nationId?: string;
  medicalCondition?: string;
  allergyDrug?: string;
  addressId?: number;
  addressNationId?: number;
}

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ✅ ใส่ port จริงของ backend
  const API = 'http://localhost:3000/auth/register';

  const register = async (data: RegisterPayload) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await axios.post(API, data);

      setSuccess(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          (err.response?.data as any)?.message ||
          'Something went wrong'
        );
      } else {
        setError('Something went wrong');
      }
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