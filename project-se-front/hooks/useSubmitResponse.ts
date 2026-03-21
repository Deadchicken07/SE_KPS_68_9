import axios from "axios"
import { useState } from "react"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

interface AnswerPayload {
  question_id: number
  choice_id: number
}

interface SubmitPayload {
  questionnaire_id: number
  user_id: number | null
  answers: AnswerPayload[]
}

export const useSubmitResponse = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (payload: SubmitPayload) => {
    try {
      setLoading(true)
      await axios.post(`${API}/responses`, payload)
    } catch {
      setError("ส่งคำตอบไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error }
}
