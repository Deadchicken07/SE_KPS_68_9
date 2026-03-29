"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ResponseDetail, ResponseSummary } from "@/types/response.types";

const API = process.env.NEXT_PUBLIC_API_URL;

export const useUserResponses = (userId: number) => {
  const [data, setData] = useState<ResponseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      try {
        if (data.length === 0) {
          setIsLoading(true);
        } else {
          setIsFetching(true);
        }
        setError(null);
        const res = await axios.get<ResponseSummary[]>(
          `${API}/responses/user/${userId}`,
          { withCredentials: true }
        );
        setData(res.data);
      } catch {
        setError("ไม่สามารถดึงข้อมูลแบบประเมินได้");
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };
    fetch();
  }, [data.length, userId]);

  return { data, isLoading, isFetching, error };
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
