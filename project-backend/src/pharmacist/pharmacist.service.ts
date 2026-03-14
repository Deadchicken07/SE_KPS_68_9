import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { DeliveryHistoryQueryDto } from './dto/delivery-history-query.dto';
import { DeliveryHistoryResponseDto } from './dto/delivery-history-response.dto';
import { MedicationResponseDto } from './dto/medication-response.dto';
import { PatientHistoryQueryDto } from './dto/patient-history-query.dto';
import {
  PatientConsultationRecordDto,
  PatientHistoryResponseDto,
} from './dto/patient-history-response.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Injectable()
export class PharmacistService {
  constructor(private readonly prisma: PrismaService) {}

  async findMedications(search?: string): Promise<MedicationResponseDto[]> {
    const normalizedSearch = search?.trim();

    const medications = await this.prisma.medications.findMany({
      where: normalizedSearch
        ? {
            name: {
              contains: normalizedSearch,
              mode: 'insensitive',
            },
          }
        : undefined,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });

    return medications.map((medication) => this.mapMedication(medication));
  }

  async createMedication(
    dto: CreateMedicationDto,
  ): Promise<MedicationResponseDto> {
    const data = this.buildCreateMedicationData(dto);
    const medication = await this.prisma.medications.create({ data });
    return this.mapMedication(medication);
  }

  async updateMedication(
    id: number,
    dto: UpdateMedicationDto,
  ): Promise<MedicationResponseDto> {
    await this.ensureMedicationExists(id);
    const data = this.buildUpdateMedicationData(dto);

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No medication fields provided');
    }

    const medication = await this.prisma.medications.update({
      where: { id },
      data,
    });

    return this.mapMedication(medication);
  }

  async removeMedication(id: number) {
    await this.ensureMedicationExists(id);

    const [prescriptionUsage, receiptUsage] = await Promise.all([
      this.prisma.prescription_items.count({ where: { medication_id: id } }),
      this.prisma.receipt_details.count({ where: { medicine_id: id } }),
    ]);

    if (prescriptionUsage > 0 || receiptUsage > 0) {
      throw new BadRequestException(
        'Cannot delete medication because it is already referenced in records',
      );
    }

    await this.prisma.medications.delete({ where: { id } });

    return {
      message: 'Medication deleted successfully',
      id,
    };
  }

  async findDeliveryHistory(
    query: DeliveryHistoryQueryDto,
  ): Promise<DeliveryHistoryResponseDto[]> {
    const search = query.search?.trim();
    const status = query.status?.trim();

    const receipts = await this.prisma.receipts.findMany({
      where: {
        ...(status && status !== 'all' ? { status } : {}),
        ...(search
          ? {
              OR: [
                { tracking: { contains: search, mode: 'insensitive' } },
                { status: { contains: search, mode: 'insensitive' } },
                {
                  users: {
                    is: {
                      OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { sur_name: { contains: search, mode: 'insensitive' } },
                      ],
                    },
                  },
                },
                {
                  receipt_details: {
                    some: {
                      OR: [
                        {
                          item_name: {
                            contains: search,
                            mode: 'insensitive',
                          },
                        },
                        {
                          medications: {
                            is: {
                              name: {
                                contains: search,
                                mode: 'insensitive',
                              },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        users: {
          select: {
            user_id: true,
            name: true,
            sur_name: true,
          },
        },
        consultations: {
          select: {
            id: true,
            users_consultations_pharmacist_idTousers: {
              select: {
                name: true,
                sur_name: true,
              },
            },
          },
        },
        receipt_details: {
          orderBy: { id: 'asc' },
          include: {
            medications: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    });

    return receipts.map((receipt) => ({
      receiptId: receipt.id,
      consultationId: receipt.consultation_id ?? null,
      patientId: receipt.users?.user_id ?? receipt.user_id ?? null,
      patientName: this.buildFullName(
        receipt.users?.name,
        receipt.users?.sur_name,
      ),
      pharmacistName: this.buildFullName(
        receipt.consultations?.users_consultations_pharmacist_idTousers?.name,
        receipt.consultations?.users_consultations_pharmacist_idTousers
          ?.sur_name,
      ),
      tracking: receipt.tracking ?? null,
      status: receipt.status ?? null,
      total: this.toNumber(receipt.total),
      createdAt: this.toIsoString(receipt.created_at),
      items: receipt.receipt_details.map((item) => ({
        receiptDetailId: item.id,
        itemName: item.item_name ?? item.medications?.name ?? '-',
        itemType: item.item_type ?? null,
        quantity: item.quantity ?? 0,
        unitPrice: this.toNumber(item.unit_price),
        totalPrice: this.toNumber(item.total_price),
        medicineId: item.medicine_id ?? null,
        medicineName: item.medications?.name ?? null,
      })),
    }));
  }

  async findPatientHistory(
    query: PatientHistoryQueryDto,
  ): Promise<PatientHistoryResponseDto[]> {
    const search = query.search?.trim();

    const consultations = await this.prisma.consultations.findMany({
      where: search
        ? {
            users_consultations_user_idTousers: {
              is: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { sur_name: { contains: search, mode: 'insensitive' } },
                  { phone: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          }
        : undefined,
      include: {
        users_consultations_user_idTousers: {
          select: {
            user_id: true,
            name: true,
            sur_name: true,
            phone: true,
            medical_condition: true,
            allergy_drug: true,
          },
        },
        users_consultations_pharmacist_idTousers: {
          select: {
            name: true,
            sur_name: true,
          },
        },
        prescription_items: {
          orderBy: { id: 'asc' },
          include: {
            medications: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        receipts: {
          orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            tracking: true,
            status: true,
            total: true,
            created_at: true,
          },
        },
      },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    });

    const grouped = new Map<number, PatientHistoryResponseDto>();

    consultations.forEach((consultation) => {
      const patient = consultation.users_consultations_user_idTousers;

      if (!patient) {
        return;
      }

      const patientId = patient.user_id;
      const record: PatientConsultationRecordDto = {
        consultationId: consultation.id,
        note: consultation.note ?? null,
        createdAt: this.toIsoString(consultation.created_at),
        pharmacistName: this.buildFullName(
          consultation.users_consultations_pharmacist_idTousers?.name,
          consultation.users_consultations_pharmacist_idTousers?.sur_name,
        ),
        medicines: consultation.prescription_items.map((item) => ({
          id: item.medications?.id ?? item.medication_id ?? item.id,
          name: item.medications?.name ?? '-',
          quantity: item.quantity ?? 0,
          comment: item.comment ?? null,
        })),
        receipts: consultation.receipts.map((receipt) => ({
          receiptId: receipt.id,
          tracking: receipt.tracking ?? null,
          status: receipt.status ?? null,
          total: this.toNumber(receipt.total),
          createdAt: this.toIsoString(receipt.created_at),
        })),
      };

      const existing = grouped.get(patientId);

      if (!existing) {
        grouped.set(patientId, {
          patientId,
          patientName: this.buildFullName(patient.name, patient.sur_name),
          phone: patient.phone ?? null,
          medicalCondition: patient.medical_condition ?? null,
          allergyDrug: patient.allergy_drug ?? null,
          latestConsultedAt: record.createdAt,
          latestNote: record.note,
          recordCount: 1,
          records: [record],
        });
        return;
      }

      existing.records.push(record);
      existing.recordCount += 1;
    });

    return Array.from(grouped.values()).map((patient) => ({
      ...patient,
      records: patient.records.sort((a, b) =>
        (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
      ),
    }));
  }

  private buildCreateMedicationData(
    dto: CreateMedicationDto,
  ): Prisma.medicationsUncheckedCreateInput {
    const name = dto.name?.trim();

    if (!name) {
      throw new BadRequestException('Medication name is required');
    }

    return {
      name,
      retail: this.parseDecimal(dto.retail, 'retail') ?? null,
      price: this.parseDecimal(dto.price, 'price') ?? null,
    };
  }

  private buildUpdateMedicationData(
    dto: UpdateMedicationDto,
  ): Prisma.medicationsUncheckedUpdateInput {
    const data: Prisma.medicationsUncheckedUpdateInput = {};

    if (Object.prototype.hasOwnProperty.call(dto, 'name')) {
      const name = dto.name?.trim();

      if (!name) {
        throw new BadRequestException('Medication name is required');
      }

      data.name = name;
    }

    if (Object.prototype.hasOwnProperty.call(dto, 'retail')) {
      data.retail = this.parseDecimal(dto.retail, 'retail');
    }

    if (Object.prototype.hasOwnProperty.call(dto, 'price')) {
      data.price = this.parseDecimal(dto.price, 'price');
    }

    return data;
  }

  private async ensureMedicationExists(id: number) {
    const medication = await this.prisma.medications.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!medication) {
      throw new NotFoundException('Medication not found');
    }
  }

  private mapMedication(
    medication: Prisma.medicationsGetPayload<Record<string, never>>,
  ): MedicationResponseDto {
    return {
      id: medication.id,
      name: medication.name,
      retail: this.toNumber(medication.retail),
      price: this.toNumber(medication.price),
    };
  }

  private parseDecimal(
    value: number | string | null | undefined,
    fieldName: string,
  ): Prisma.Decimal | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === '') {
      return null;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new BadRequestException(
        `${fieldName} must be a non-negative number`,
      );
    }

    return new Prisma.Decimal(parsed.toFixed(2));
  }

  private toNumber(value: Prisma.Decimal | number | null | undefined) {
    if (value === null || value === undefined) {
      return null;
    }

    return Number(value.toString());
  }

  private buildFullName(firstName?: string | null, lastName?: string | null) {
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    return fullName || '-';
  }

  private toIsoString(value: Date | null | undefined) {
    return value ? value.toISOString() : null;
  }
}
