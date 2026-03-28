import { Injectable } from '@nestjs/common';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService){}

  async findAll(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.consultations.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          prescription_items: {
            include: { medications: true },
          },
        },
      }),
      this.prisma.consultations.count({ where: { user_id: userId } }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async create(dto : CreateConsultationDto){
    return this.prisma.consultations.create({
      data : {
        user_id : dto.user_id,
        staff_id : dto.staff_id,
        note : dto.note,
        prescription_items : {
          create : dto.prescription_item ?? []
        }
      }
    })
  }
}
