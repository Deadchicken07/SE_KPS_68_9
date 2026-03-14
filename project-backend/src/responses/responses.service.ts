import { Injectable } from '@nestjs/common';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResponsesService {
  constructor(private prisma: PrismaService) {}

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
