import { useState } from 'react';
import axios from 'axios';

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
  email?: string | null;
  phone?: string;
  nationId: string;
  currentAddress?: Address | null;
  nationAddress?: Address | null;
}

interface ErrorResponse {
  message?: string;
}

type NationCheckResult =
  | { status: 'not_found' }
  | { status: 'completed' }
  | { status: 'incomplete'; data: NationUserResponse };

export const useNationCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] =
    useState<NationUserResponse | null>(null);

  const checkNation = async (
    nationId: string
  ): Promise<NationCheckResult> => {
    try {
      setLoading(true);
      setError(null);
      setUserData(null);

      const res = await axios.get<NationUserResponse>(
        `${API}/users/by-nation/${nationId}`
      );

      const user = res.data;
      setUserData(user);

      if (user.email && user.email.trim() !== '') {
        return { status: 'completed' };
      }

      return {
        status: 'incomplete',
        data: user,
      };
    } catch (err: unknown) {
      if (axios.isAxiosError<ErrorResponse>(err)) {
        if (err.response?.status === 404) {
          return { status: 'not_found' };
        }

        const message =
          err.response?.data?.message ??
          'ไม่สามารถใช้เลขบัตรนี้ได้';

        setError(message);

        return { status: 'completed' };
      }

      setError('เกิดข้อผิดพลาดบางอย่าง');
      return { status: 'completed' };
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