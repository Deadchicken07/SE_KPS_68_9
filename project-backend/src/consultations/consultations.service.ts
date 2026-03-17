import { Injectable } from '@nestjs/common';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService){}

  async findAll(userId : number){
    const consults  = await this.prisma.consultations.findMany({
      where : {
        user_id : userId
      }
    })
  }
}
