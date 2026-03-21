import { Pagination } from "./pagination.types"
import { Questions } from "./question.types"

export interface Questionnaires{
    id : number,
    title : string,
    status : 'show' | 'hidden',
    created_at : string,
}

export interface QuestionnaireWithQuestions{
    id : number 
    title : string,
    status : 'show' | 'hidden',
    create : string,
    questions : Questions[] 
}

export interface QuestionnaireResponse{
    data : QuestionnaireWithQuestions,
    meta : Pagination,
}

export interface QuestionnairePayload {
    title?: string
    status?: 'show' | 'hidden'
}