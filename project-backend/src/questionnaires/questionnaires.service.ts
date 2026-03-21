import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { questionnaires_type_enum } from '@prisma/client';

@Injectable()
export class QuestionnairesService {
  constructor(private prisma : PrismaService){}
  
  async findAll(){
    return this.prisma.questionnaires.findMany({
      orderBy:{
        created_at:'desc',
      }
    })
  }

  async findStatus(status : questionnaires_type_enum){
    return this.prisma.questionnaires.findMany({
      where: {
        status: status,
      },
      orderBy: {
        created_at: 'desc'
      }
  
    })
  }

  async create(data : CreateQuestionnaireDto){
    return this.prisma.questionnaires.create({
      data,
    });
  }

  async findOne(id : number , page = 1 , limit = 10){
    const questionnaire = await this.prisma.questionnaires.findUnique({
      where: {id},
      include : {
        questions : {
          include : {
            choices : {
              orderBy : {
                weight : 'asc'
              }
            }

          },
          orderBy : {
            id : 'asc'
          },
          skip : (page - 1) * limit,
          take : limit,
        },
        _count: {
          select: {
            questions : true 
          }
        }
      }
    })

    if (!questionnaire) throw new NotFoundException('Questionnaire not found')

    return {
      data : questionnaire,
      meta : {
        page,
        limit,
        total : questionnaire._count.questions
      }
    };
  }

  async update(id : number,data : UpdateQuestionnaireDto){
    const existing = await this.prisma.questionnaires.findUnique({
      where: {id: id}
    });

    if (!existing){
      throw new NotFoundException('Questionnaire not found');
    }else{
      return this.prisma.questionnaires.update({
        where: {id},
        data,
      })
    }
  }

  async delete(id : number){
    return this.prisma.questionnaires.delete({
      where:{
        id: id,
      }
    })
  }


}