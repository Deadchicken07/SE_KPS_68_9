import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { LoginResponse } from '@/types/auth.types';
import { ErrorResponse } from '@/types/api.types';

const API = 'http://localhost:4000';



export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (
    email: string,
    password: string
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post<LoginResponse>(
        `${API}/auth/login`,
        { email, password }
      );

      const token = res.data.access_token;

      localStorage.setItem('access_token', token);

      return token;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ErrorResponse>;
        setError(
          axiosError.response?.data?.message || 'Login failed'
        );
      } else {
        setError('Unexpected error');
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
  };
};