import { Questionnaire, QuestionnairePayload } from "@/types/questionnaire.types"
import { useEffect, useState } from "react"
import axios from "axios"

const API = process.env.NEXT_PUBLIC_API_URL

export const useQuestionnaire = () => {
    const [questionnaires,setQuestionnaires] = useState<Questionnaire[]>([])
    const [loading,setLoading] = useState(false)
    const [error,setError] = useState<string | null>(null);

    useEffect(() => {                                
        const fetch = async () => {
            try {
                setLoading(true)
                
                const res = await axios.get<Questionnaire[]>(  
                    `${API}/questionnaires`
                )
                
                setQuestionnaires(res.data)          
            } catch {
                setError("ไม่สามารถดึงข้อมูลได้")
            } finally {
                setLoading(false)                    
            }
        }

        fetch()
    }, [])                                           



    return { questionnaires, loading, error, }
}