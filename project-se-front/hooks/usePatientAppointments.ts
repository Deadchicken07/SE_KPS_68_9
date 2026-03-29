'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

export interface PatientAppointment {
  id: number;
  appointmentDate: string | null;
  timeSelect: string | null;
  appointmentType: string | null;
}

export const usePatientAppointments = (userId: number | null, staffId?: number | null) => {
  const [data, setData] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) { setData([]); return; }
    setLoading(true);
    axios
      .get<PatientAppointment[]>(`${API}/appointments/patient/${userId}`, {
        params: staffId ? { staffId } : {},
        withCredentials: true,
      })
      .then((res) => setData(res.data.map((a: any) => ({
        id: a.id,
        appointmentDate: a.appointmentDate ?? a.appointment_date ?? null,
        timeSelect: a.timeSelect ?? a.time_select ?? null,
        appointmentType: a.appointmentType ?? a.appointment_type ?? null,
      }))))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [userId, staffId]);

  return { data, loading };
};
