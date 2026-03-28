import { useEffect, useState } from "react";
import { Consultation, ConsultationMeta, CreateConsultation } from "@/types/consult.types";
import axios from "axios";

export const useConsultation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const createConsultation = async (data: CreateConsultation) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      await axios.post(`${API}/consultations`, data);

      setSuccess(true);
      return true;
    } catch (err: unknown) {
      let message = "Something went wrong";

      if (axios.isAxiosError<{ message?: string | string[] }>(err)) {
        const resMessage = err.response?.data?.message;
        if (Array.isArray(resMessage)) {
          message = resMessage.join(", ");
        } else if (resMessage) {
          message = resMessage;
        }
      }

      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createConsultation, loading, error, success };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useConsultations = (userId: number, page: number = 1, limit: number = 10) => {
  const [data, setData] = useState<Consultation[]>([]);
  const [meta, setMeta] = useState<ConsultationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get<{ data: Consultation[]; meta: ConsultationMeta }>(
          `${API_URL}/consultations`,
          { params: { userId, page, limit } }
        );
        setData(res.data.data);
        setMeta(res.data.meta);
      } catch {
        setError("ไม่สามารถดึงประวัติการปรึกษาได้");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId, page, limit]);

  return { data, meta, loading, error };
};
