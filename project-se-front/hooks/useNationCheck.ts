'use client'
import { useState } from 'react';
import axios, { AxiosError } from 'axios';

const API = "http://localhost:4000";

interface Address {
  provinceId?: number;
  districtId?: number;
  subDistrictId?: number;
  zipCodeId?: number;
  detail?: string;
}

interface NationUserResponse {
  id: number;
  name: string;
  surName: string;
  email?: string | null;
  phone?: string;
  nationId: string;
  title: string;

  medicalCondition?: string | null;
  allergyDrug?: string | null;

  currentAddress?: Address | null;
  nationAddress?: Address | null;
}

type NationCheckResult =
  | { status: "new" }
  | { status: "mismatch" }
  | { status: "completed" }
  | { status: "incomplete"; data: NationUserResponse };

export const useNationCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkNation = async (
    nationId: string,
    name: string,
    surName: string
  ): Promise<NationCheckResult> => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get<NationCheckResult>(
        `${API}/users/by-nation/${nationId}`,
        { params: { name, surName } }
      );

      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          return { status: "new" };
        }
      }

      setError("เกิดข้อผิดพลาดบางอย่าง");
      return { status: "completed" };
    } finally {
      setLoading(false);
    }
  };

  return {
    checkNation,
    loading,
    error,
  };
};