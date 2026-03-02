import { questionnaires_type_enum } from "@prisma/client";
export class CreateQuestionnaireDto {
    title?: string;
    status?: questionnaires_type_enum;
}
