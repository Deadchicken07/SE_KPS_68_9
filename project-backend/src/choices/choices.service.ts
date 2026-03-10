
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChoiceDto } from './dto/create-choice.dto';
import { UpdateChoiceDto } from './dto/update-choice.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChoicesService {
    constructor(private prisma : PrismaService){}

    async findAll(questionId : number){
      return this.prisma.choices.findMany({
        where : {
          question_id : questionId,
        }
      })
    }

    async update(choiceId : number , data : UpdateChoiceDto){
      const question = await this.prisma.choices.findUnique({
        where : {
          id : choiceId 
        }
      })

      if(!question){
        throw new NotFoundException('Choice not found');
      }else{
        return this.prisma.choices.update({
          where : {
            id : choiceId
          },
          data

        })
      }
    }

    async create(questionId : number,dto : CreateChoiceDto){
      const choice = await this.prisma.choices.create({
        data : {
          ...dto,
          question_id: questionId
        }
      })

      return choice ;
    }

    async delete(choiceId : number){
      return this.prisma.choices.delete({
        where : {
          id : choiceId
        }
      })
    }
}
