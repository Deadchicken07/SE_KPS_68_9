"use client";
import {
  Questionnaires,
  QuestionnairePayload,
  QuestionnaireWithQuestions,
  QuestionnaireResponse,
} from "@/types/questionnaire.types";
import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const useQuestionnaire = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaires[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);

        const res = await axios.get<Questionnaires[]>(`${API}/questionnaires`);

        setQuestionnaires(res.data);
      } catch {
        setError("ไม่สามารถดึงข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { questionnaires, loading, error , };
};

export const useQuestionnaires = (id: number,page : number = 1 , limit : number = 5) => {
  const [data,setData] = useState<QuestionnaireResponse["data"] | null>(null)
  const [meta,setMeta] = useState<QuestionnaireResponse["meta"] | null>(null)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);

        const res = await axios.get<QuestionnaireResponse>(`${API}/questionnaires/${id}`,{params: {page,limit}});
        console.log(res)
        setData(res.data.data);
        setMeta(res.data.meta)
      } catch {
        setError("ไม่สามารถดึงข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id,page,limit]);

  return { data, meta, loading, error };
}
