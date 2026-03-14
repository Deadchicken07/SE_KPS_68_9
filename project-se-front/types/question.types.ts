import { Choice } from "./choice.types";

export interface Questions{
    id : number,
    questionnaire_id : number,
    question_text : string,
    choices : Choice[]
}
