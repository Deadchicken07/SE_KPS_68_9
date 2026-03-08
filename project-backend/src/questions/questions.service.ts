import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQueryDto } from './dto/pagination-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService){};

  async findAll(questionnaireId : number, query : PaginationQueryDto){
    const page = Number(query.page) || 1 ;
    const limit = Number(query.limit) || 10 ;
    
    if (page < 0)throw new BadRequestException('page ต้องมากว่า 0');
    if (limit < 0)throw new BadRequestException('limit ต้องมากกว่า 0');

    const where = {questionnaire_id : questionnaireId}

    const skip = (page-1) * limit

    const [data,total] = await this.prisma.$transaction([
      this.prisma.questions.findMany({
        where,
        skip,
        take: limit,
        orderBy : {id:'asc'}
      }),
      this.prisma.questions.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages : Math.ceil(total/limit),
        hasNextPage : page < Math.ceil(total/limit),
        hasPrevPage : page > 1 ,
      }
    }
  }

  async findOne(questionnaireId : number,questionId : number){
    const question = await this.prisma.questions.findUnique({
      where : {
        questionnaire_id : questionnaireId,
        id : questionId
      }
    })

    if(!question){
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async create(questionnaireId : number,dto : CreateQuestionDto){
    const question = await this.prisma.questions.create({
      data : {
        ...dto,
        questionnaire_id : questionnaireId,
      },
    })
    return question
  }

  async update(questionId : number,dto : UpdateQuestionDto){
    const question = await this.prisma.questions.findUnique({
      where : { id: questionId}
    })  

    if (!question){
      throw new NotFoundException('Question not found');
    }else{
      return this.prisma.questions.update({
        where : {id : questionId},
        data : {
          ...dto
        }
      })
    }
  }
}
