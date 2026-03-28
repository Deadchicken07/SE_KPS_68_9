import { Injectable } from '@nestjs/common';
import { item_type_enum, receipt_status } from '@prisma/client';
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

  async create(dto: CreateConsultationDto) {
    const consultation = await this.prisma.consultations.create({
      data: {
        user_id: dto.user_id,
        staff_id: dto.staff_id,
        note: dto.note,
        prescription_items: {
          create: dto.prescription_item ?? [],
        },
      },
    });

    const receiptDetails: {
      item_name: string;
      item_type: item_type_enum;
      medicine_id?: number;
      medicine_price?: number;
      quantity: number;
      unit_price: number;
      total_price: number;
    }[] = [];
    let total = 0;

    // ยา
    if (dto.prescription_item && dto.prescription_item.length > 0) {
      const medIds = dto.prescription_item.map((p) => p.medication_id);
      const medications = await this.prisma.medications.findMany({
        where: { id: { in: medIds } },
      });

      for (const item of dto.prescription_item) {
        const med = medications.find((m) => m.id === item.medication_id);
        if (med) {
          const unitPrice = Number(med.retail ?? med.price ?? 0);
          const totalPrice = unitPrice * item.quantity;
          total += totalPrice;
          receiptDetails.push({
            item_name: med.name,
            item_type: item_type_enum.medicine,
            medicine_id: med.id,
            medicine_price: med.price ? Number(med.price) : undefined,
            quantity: item.quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
          });
        }
      }
    }

    // ค่าบริการจาก role ของ staff
    const staff = await this.prisma.users.findUnique({
      where: { user_id: dto.staff_id },
      select: { role_id: true },
    });

    if (staff?.role_id) {
      const role = await this.prisma.roles.findUnique({
        where: { id: staff.role_id },
      });

      if (role?.fee_id) {
        const fee = await this.prisma.fees.findUnique({
          where: { id: role.fee_id },
        });

        if (fee) {
          const feeAmount = Number(fee.price_per_hours ?? 0);
          total += feeAmount;
          receiptDetails.push({
            item_name: 'ค่าบริการ',
            item_type: item_type_enum.fee,
            quantity: 1,
            unit_price: feeAmount,
            total_price: feeAmount,
          });
        }
      }
    }

    const status = dto.is_online
      ? receipt_status.pending_delivery
      : receipt_status.pending_pickup;

    await this.prisma.receipts.create({
      data: {
        consultation_id: consultation.id,
        user_id: dto.user_id,
        total,
        status,
        receipt_details: {
          create: receiptDetails,
        },
      },
    });

    return consultation;
  }
}
