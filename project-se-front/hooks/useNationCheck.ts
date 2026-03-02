import { useState } from 'react';
import axios, { AxiosError } from 'axios';

const API = 'http://localhost:4000';

interface Address {
  provinceId?: number;
  provinceName?: string;
  districtId?: number;
  districtName?: string;
  subDistrictId?: number;
  subDistrictName?: string;
  zipCode?: string;
  detail?: string;
}

interface NationUserResponse {
  id: number;
  name: string;
  surName: string;
  phone?: string;
  nationId: string;
  currentAddress?: Address | null;
  nationAddress?: Address | null;
}

interface ErrorResponse {
  message: string;
}

export const useNationCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<NationUserResponse | null>(null);

  const checkNation = async (nationId: string) => {
    try {
      setLoading(true);
      setError(null);
      setUserData(null);

      const res = await axios.get<NationUserResponse>(
        `${API}/users/by-nation/${nationId}`
      );

      setUserData(res.data);

      return {
        exists: true,
        data: res.data,
      };
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;

      if (axiosError.response?.status === 404) {
        // ไม่เจอ user = สมัครใหม่
        return { exists: false };
      }

      // กรณี email มีแล้ว (400)
      setError(
        axiosError.response?.data?.message ??
          'ไม่สามารถใช้เลขบัตรนี้ได้เนื่องจากมีบัญชีทีใชเงานอยู่แล้ว'
      );

      return { exists: true, blocked: true };
    } finally {
      setLoading(false);
    }
  };

  return {
    checkNation,
    userData,
    loading,
    error,
  };
};