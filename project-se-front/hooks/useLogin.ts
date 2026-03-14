'use client'
import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { AuthMeResponse, LoginResponse } from '@/types/auth.types';
import { ErrorResponse } from '@/types/api.types';

const API = process.env.NEXT_PUBLIC_API_URL;



export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (
    email: string,
    password: string
  ): Promise<AuthMeResponse> => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post<LoginResponse>(
        `${API}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
      }

      const me = await axios.get<AuthMeResponse>(`${API}/auth/me`, {
        withCredentials: true,
      });

      return me.data;
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
