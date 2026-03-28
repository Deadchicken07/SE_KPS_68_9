"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Appointment } from "@/types/appointment.types";

const API = process.env.NEXT_PUBLIC_API_URL;

export const useStaffById = (id: number | null, date: string | null) => {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get<Appointment[]>(`${API}/appointments/staff/${id}`, {
          params: date ? { date } : {},
          withCredentials: true,
        });
        setData(res.data);
      } catch {
        setError("ไม่สามารถดึงข้อมูลนัดหมายได้");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id, date]);

  return { data, loading, error };
};
