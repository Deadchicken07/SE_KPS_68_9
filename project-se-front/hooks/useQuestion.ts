'use client'
import {Questions} from "@/types/question.types"
import { Pagination } from "@/types/pagination.types"
import axios from "axios"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_URL;

export const  useQuestions = (questionnaireId: number) => {
    const [questions,setQuestions] = useState<Questions[]>([])
    const [paginate,setPaginate] = useState<Pagination[]>([])
    const [loading,setLoading] = useState(false)
    const [error,setError] = useState<string | null>(null);

    useEffect(() => {                                
        const fetch = async () => {
            try {
                setLoading(true)
                
                const res = await axios.get<{data : Questions[],meta : Pagination[]}>(  
                    `${API}/questionnaires/${questionnaireId}/questions`
                )
                console.log(res)
                setQuestions(res.data.data)
                setPaginate(res.data.meta)
            } catch {
                setError("ไม่สามารถดึงข้อมูลได้")
                setQuestions([])
            } finally {
                setLoading(false)                    
            }
        }

        fetch()
    }, [questionnaireId])

     return { questions, paginate,loading, error, }
}
