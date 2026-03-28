import { Injectable } from '@nestjs/common';
import { CreateResponseDto } from './dto/create-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResponsesService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: number) {
    const responses = await this.prisma.responses.findMany({
      where: { user_id: userId },
      orderBy: { submitted_at: 'desc' },
      include: { questionnaires: { select: { title: true } } },
    });
    return responses.map((r) => ({
      id: r.id,
      questionnaire_title: r.questionnaires?.title,
      submitted_at: r.submitted_at,
    }));
  }

  async findOne(id: number) {
    const response = await this.prisma.responses.findUnique({
      where: { id },
      include: {
        questionnaires: { select: { title: true } },
        answers: {
          include: {
            questions: { select: { question_text: true } },
            choices: { select: { choice_text: true, weight: true } },
          },
        },
      },
    });
    if (!response) return null;
    const total_score = response.answers.reduce((sum, a) => sum + (a.choices?.weight ?? 0), 0);
    return {
      id: response.id,
      questionnaire_title: response.questionnaires?.title,
      submitted_at: response.submitted_at,
      total_score,
      answers: response.answers.map((a) => ({
        question_text: a.questions?.question_text,
        choice_text: a.choices?.choice_text,
        weight: a.choices?.weight,
      })),
    };
  }

  async create(data: CreateResponseDto){
    return this.prisma.responses.create({
      data: {
        questionnaire_id : data.questionnaire_id,
        user_id : data.user_id,
        submitted_at : new Date(),
        answers:{
          create : data.answers
        }
      },
      include: {
        answers: true
      }
    })
  }
}
