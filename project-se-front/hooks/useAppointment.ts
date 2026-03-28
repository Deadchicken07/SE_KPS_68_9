"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Appointment } from "@/types/appointment.types";

const API = process.env.NEXT_PUBLIC_API_URL;

export const useAppointment = (date: string | null) => {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get<Appointment[]>(`${API}/appointments/staff`, {
          params: date ? { date } : {},
        });
        setData(res.data);
      } catch {
        setError("ไม่สามารถดึงข้อมูลนัดหมายได้");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [date]);

  return { data, loading, error };
};
