import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionnaireDto } from './create-questionnaire.dto';
import { questionnaires_type_enum } from '@prisma/client';

export class UpdateQuestionnaireDto extends PartialType(CreateQuestionnaireDto) {
    title?: string;
    status?: questionnaires_type_enum;
}
