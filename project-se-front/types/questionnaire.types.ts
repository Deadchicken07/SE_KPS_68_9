export interface Questionnaires{
    id : number,
    title : string,
    status : 'show' | 'hidden',
    created_at : string,
}

export interface QuestionnairePayload {
    title?: string
    status?: 'show' | 'hidden'
}