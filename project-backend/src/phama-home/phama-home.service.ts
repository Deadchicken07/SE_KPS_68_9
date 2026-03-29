import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const RECEIPT_STATUS_VALUES = new Set([
  'pending_delivery',
  'delivered',
  'pending_pickup',
  'picked_up',
  'cancelled',
]);

const consultationArgs = Prisma.validator<Prisma.consultationsDefaultArgs>()({
  include: {
    users_consultations_user_idTousers: {
      select: {
        user_id: true,
        title: true,
        name: true,
        sur_name: true,
        email: true,
        phone: true,
        allergy_drug: true,
      },
    },
    users_consultations_staff_idTousers: {
      select: {
        user_id: true,
        title: true,
        name: true,
        sur_name: true,
        info: true,
        roles: {
          select: {
            name: true,
          },
        },
      },
    },
    users_consultations_pharmacist_idTousers: {
      select: {
        user_id: true,
        title: true,
        name: true,
        sur_name: true,
        info: true,
        roles: {
          select: {
            name: true,
          },
        },
      },
    },
    prescription_items: {
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        consultation_id: true,
        medication_id: true,
        comment: true,
        quantity: true,
        medications: {
          select: {
            id: true,
            name: true,
            price: true,
            retail: true,
          },
        },
      },
    },
  },
});

type ConsultationRecord = Prisma.consultationsGetPayload<
  typeof consultationArgs
>;
type ReceiptRow = {
  id: number;
  consultation_id: number | null;
  user_id: number | null;
  created_at: Date | null;
  slip_file: string | null;
  total: Prisma.Decimal | number | string | null;
  tracking: string | null;
  status: string | null;
  payment_status: string | null;
};

@Injectable()
export class PhamaHomeService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrders() {
    const where: Prisma.consultationsWhereInput = {
      prescription_items: {
        some: {},
      },
      receipts: {
        some: {},
      },
    }

    const consultations = await this.prisma.consultations.findMany({
      ...consultationArgs,
      where,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: 50,
    });
    const receiptsByConsultationId = await this.loadReceipts(
      consultations.map((consultation) => consultation.id),
    );

    return {
      generatedAt: new Date().toISOString(),
      totalConsultations: consultations.length,
      consultations: consultations.map((consultation) =>
        this.mapConsultation(
          consultation,
          receiptsByConsultationId.get(consultation.id) ?? [],
        ),
      ),
    };
  }

  async updateOrderStatus(
    consultationId: number,
    currentUserId: number,
    roleId: number,
    rawStatus?: string,
    rawTracking?: string,
  ) {
    const status = rawStatus?.trim();
    const tracking = rawTracking?.trim() || null;

    if (!status) {
      throw new BadRequestException('status is required');
    }

    if (!RECEIPT_STATUS_VALUES.has(status)) {
      throw new BadRequestException(
        `status must be one of: ${Array.from(RECEIPT_STATUS_VALUES).join(', ')}`,
      );
    }

    const consultation = await this.prisma.consultations.findUnique({
      where: { id: consultationId },
      select: {
        id: true,
        user_id: true,
        pharmacist_id: true,
        prescription_items: {
          select: {
            id: true,
          },
        },
        receipts: {
          orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
          take: 1,
          select: {
            id: true,
            tracking: true,
          },
        },
      },
    });

    if (!consultation || consultation.prescription_items.length === 0) {
      throw new NotFoundException('Pharmacy order not found');
    }

    await this.prisma.$transaction(async (tx) => {
      const latestReceipt = consultation.receipts[0];
      const nextTracking = tracking ?? latestReceipt?.tracking ?? null;

      if (status === 'delivered' && !nextTracking) {
        throw new BadRequestException(
          'tracking is required when status is delivered',
        );
      }

      if (latestReceipt) {
        await tx.$executeRawUnsafe(
          'UPDATE receipts SET status = $1::receipt_status, tracking = $2 WHERE id = $3',
          status,
          nextTracking,
          latestReceipt.id,
        );
      } else {
        await tx.$executeRawUnsafe(
          'INSERT INTO receipts (consultation_id, user_id, status, tracking) VALUES ($1, $2, $3::receipt_status, $4)',
          consultation.id,
          consultation.user_id ?? null,
          status,
          nextTracking,
        );
      }

      if (roleId === 5 && consultation.pharmacist_id !== currentUserId) {
        await tx.consultations.update({
          where: { id: consultation.id },
          data: { pharmacist_id: currentUserId },
        });
      }
    });

    return {
      message: 'receipts.status updated successfully',
      consultationId,
      status,
      tracking,
    };
  }

  private async loadReceipts(consultationIds: number[]) {
    if (!consultationIds.length) {
      return new Map<number, ReceiptRow[]>();
    }

    const rows = (await this.prisma.$queryRawUnsafe(
      `SELECT id, consultation_id, user_id, created_at, slip_file, total, tracking, status::text AS status, payment_status::text AS payment_status
       FROM receipts
       WHERE consultation_id = ANY($1)
       ORDER BY created_at DESC NULLS LAST, id DESC`,
      consultationIds,
    )) as ReceiptRow[];

    const grouped = new Map<number, ReceiptRow[]>();

    rows.forEach((row) => {
      if (!row.consultation_id) {
        return;
      }

      const current = grouped.get(row.consultation_id) ?? [];
      current.push(row);
      grouped.set(row.consultation_id, current);
    });

    return grouped;
  }

  private mapConsultation(
    consultation: ConsultationRecord,
    receipts: ReceiptRow[],
  ) {
    return {
      id: consultation.id,
      user_id: consultation.user_id,
      staff_id: consultation.staff_id,
      pharmacist_id: consultation.pharmacist_id,
      note: consultation.note,
      created_at: this.toIsoString(consultation.created_at),
      patient: consultation.users_consultations_user_idTousers
        ? {
            user_id: consultation.users_consultations_user_idTousers.user_id,
            title: consultation.users_consultations_user_idTousers.title,
            name: consultation.users_consultations_user_idTousers.name,
            sur_name: consultation.users_consultations_user_idTousers.sur_name,
            email: consultation.users_consultations_user_idTousers.email,
            phone: consultation.users_consultations_user_idTousers.phone,
            allergy_drug:
              consultation.users_consultations_user_idTousers.allergy_drug,
          }
        : null,
      staff: consultation.users_consultations_staff_idTousers
        ? {
            user_id: consultation.users_consultations_staff_idTousers.user_id,
            title: consultation.users_consultations_staff_idTousers.title,
            name: consultation.users_consultations_staff_idTousers.name,
            sur_name: consultation.users_consultations_staff_idTousers.sur_name,
            info: consultation.users_consultations_staff_idTousers.info,
            role_name:
              consultation.users_consultations_staff_idTousers.roles?.name ??
              null,
          }
        : null,
      pharmacist: consultation.users_consultations_pharmacist_idTousers
        ? {
            user_id:
              consultation.users_consultations_pharmacist_idTousers.user_id,
            title:
              consultation.users_consultations_pharmacist_idTousers.title,
            name: consultation.users_consultations_pharmacist_idTousers.name,
            sur_name:
              consultation.users_consultations_pharmacist_idTousers.sur_name,
            info: consultation.users_consultations_pharmacist_idTousers.info,
            role_name:
              consultation.users_consultations_pharmacist_idTousers.roles
                ?.name ?? null,
          }
        : null,
      prescription_items: consultation.prescription_items.map((item) => ({
        id: item.id,
        consultation_id: item.consultation_id,
        medication_id: item.medication_id,
        comment: item.comment,
        quantity: item.quantity,
        medication: item.medications
          ? {
              id: item.medications.id,
              name: item.medications.name,
              price: this.toNumber(item.medications.price),
              retail: this.toNumber(item.medications.retail),
            }
          : null,
      })),
      receipts: receipts.map((receipt) => ({
        id: receipt.id,
        consultation_id: receipt.consultation_id,
        user_id: receipt.user_id,
        created_at: this.toIsoString(receipt.created_at),
        slip_file: receipt.slip_file,
        total: this.toNumber(receipt.total),
        tracking: receipt.tracking,
        status: receipt.status,
        payment_status: receipt.payment_status,
      })),
    };
  }

  private toIsoString(value?: Date | null) {
    return value ? value.toISOString() : null;
  }

  private toNumber(value?: Prisma.Decimal | number | string | null) {
    return value === null || value === undefined ? null : Number(value);
  }
}
