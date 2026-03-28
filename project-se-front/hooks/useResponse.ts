"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ResponseDetail, ResponseSummary } from "@/types/response.types";

const API = process.env.NEXT_PUBLIC_API_URL;

export const useUserResponses = (userId: number) => {
  const [data, setData] = useState<ResponseSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get<ResponseSummary[]>(
          `${API}/responses/user/${userId}`,
          { withCredentials: true }
        );
        setData(res.data);
      } catch {
        setError("ไม่สามารถดึงข้อมูลแบบประเมินได้");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  return { data, loading, error };
};

export const useResponseDetail = () => {
  const [loading, setLoading] = useState(false);

  const getResponseDetail = async (id: number): Promise<ResponseDetail | null> => {
    try {
      setLoading(true);
      const res = await axios.get<ResponseDetail>(`${API}/responses/${id}`, { withCredentials: true });
      return res.data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getResponseDetail, loading };
};
