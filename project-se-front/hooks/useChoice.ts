import { Choice } from "@/types/choice.types";
import axios from "axios";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;
export const useChoice = (questionId: number) => {
  const [choices, setChoices] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);

        const res = await axios.get<{ data: Choice[]}>(
          `${API}/questions/${questionId}/choices`,
        );
        console.log(res);
        setChoices(res.data.data ?? []);
      } catch {
        setError("ไม่สามารถดึงข้อมูลได้");
        setChoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetch()
  },[questionId]);

  return {choices,loading,error}
};
