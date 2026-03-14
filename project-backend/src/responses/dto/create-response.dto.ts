export class CreateAnswerDto{
    question_id: number;
    choice_id: number ;
}

export class CreateResponseDto {
    questionnaire_id: number;
    user_id? : number;
    answers: CreateAnswerDto[];
}
