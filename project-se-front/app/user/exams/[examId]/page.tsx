'use client'

import { useChoice } from "@/hooks/useChoice"
import { useQuestions } from "@/hooks/useQuestion"
import { Questions } from "@/types/question.types"
import { useParams } from "next/navigation"

function QuestionItem({question} : {question : {id : number,text : string}}){
    const {choices} = useChoice(question.id)
    console.log(choices)
    return (
        <div>
            <p>{question.text}</p>
            {choices.map((c)=>(
                <p key={c.id}>{c.choice_text}</p>
            ))}
        </div>
    )
}

export default function QuestionsPage(){
    const {examId}= useParams()
    const {questions,paginate,loading,error} = useQuestions(Number(examId))
    console.log(questions)
    return (
        <div>
            {questions.map((q) => (
                <QuestionItem key={q.id} question={{id:q.id,text:q.question_text,}}/>
            ))}
        </div>
    )
}