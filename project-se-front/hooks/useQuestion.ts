'use client'
import {Questions} from "@/types/question.types"
import axios from "axios"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

type QuestionResponse =
    | Questions[]
    | { questions?: Questions[] }
    | { data?: Questions[] }

const normalizeQuestions = (payload: QuestionResponse): Questions[] => {
    if (Array.isArray(payload)) {
        return payload
    }

    if ("questions" in payload && Array.isArray(payload.questions)) {
        return payload.questions
    }

    if ("data" in payload && Array.isArray(payload.data)) {
        return payload.data
    }

    return []
}

export const  useQuestions = (questionnaireId: number) => {
    const [questions,setQuestions] = useState<Questions[]>([])
    const [loading,setLoading] = useState(false)
    const [error,setError] = useState<string | null>(null);

    useEffect(() => {                                
        const fetch = async () => {
            try {
                setLoading(true)
                
                const res = await axios.get<QuestionResponse>(  
                    `${API}/questionnaires/${questionnaireId}/questions`
                )
                
                setQuestions(normalizeQuestions(res.data))
            } catch {
                setError("ไม่สามารถดึงข้อมูลได้")
                setQuestions([])
            } finally {
                setLoading(false)                    
            }
        }

        fetch()
    }, [questionnaireId])

     return { questions, loading, error, }
}
