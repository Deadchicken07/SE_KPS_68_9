import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, item_type_enum, receipt_status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { DeliveryHistoryQueryDto } from './dto/delivery-history-query.dto';
import { DeliveryHistoryResponseDto } from './dto/delivery-history-response.dto';
import { MedicationResponseDto } from './dto/medication-response.dto';
import {
  OrderFormConsultationDto,
  OrderFormResponseDto,
} from './dto/order-form-response.dto';
import { OrderResponseDto } from './dto/order-response.dto';
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

  async getOrderForm(): Promise<OrderFormResponseDto> {
    const consultations = await this.prisma.consultations.findMany({
      where: {
        receipts: {
          some: {},
        },
      },
      include: {
        users_consultations_user_idTousers: {
          select: {
            user_id: true,
            name: true,
            sur_name: true,
            phone: true,
            medical_condition: true,
            allergy_drug: true,
            addresses: {
              select: {
                detail: true,
                sub_districts: { select: { name: true } },
                districts: { select: { name: true } },
                provinces: { select: { name: true } },
                zip_codes: { select: { code: true } },
              },
            },
          },
        },
        users_consultations_pharmacist_idTousers: {
          select: {
            user_id: true,
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
                retail: true,
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
          },
        },
      },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    });

    return {
      consultations: consultations
        .filter((consultation) =>
          this.isPendingReceipt(
            consultation.receipts[0]?.tracking ?? null,
            consultation.receipts[0]?.status ?? null,
          ),
        )
        .map((consultation) => this.mapOrderFormConsultation(consultation)),
    };
  }

  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const existingReceipt = await this.prisma.receipts.findFirst({
      where: { consultation_id: dto.consultationId },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      select: { id: true },
    });

    if (!existingReceipt) {
      throw new NotFoundException('Receipt not found');
    }

    const updatedReceipt = await this.prisma.receipts.update({
      where: { id: existingReceipt.id },
      data: {
        tracking: dto.tracking?.trim() || null,
        status: this.resolveReceiptStatus(
          dto.tracking?.trim() || null,
          dto.status?.trim() || null,
        ),
      },
      include: {
        users: {
          select: {
            user_id: true,
            name: true,
            sur_name: true,
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
    });

    return this.mapOrderReceipt(updatedReceipt);
  }

  async findDeliveryHistory(
    query: DeliveryHistoryQueryDto,
  ): Promise<DeliveryHistoryResponseDto[]> {
    const search = query.search?.trim();
    const status = query.status?.trim();

    const receipts = await this.prisma.receipts.findMany({
      where: {
        ...this.buildDeliveryHistoryStatusFilter(status),
        ...(search
          ? {
              OR: [
                { tracking: { contains: search, mode: 'insensitive' } },
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

    if (dto.retail === null || dto.retail === undefined || dto.retail === '') {
      throw new BadRequestException('Medication retail is required');
    }

    if (dto.price === null || dto.price === undefined || dto.price === '') {
      throw new BadRequestException('Medication price is required');
    }

    return {
      name,
      retail: this.parseDecimal(dto.retail, 'retail'),
      price: this.parseDecimal(dto.price, 'price'),
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
      if (dto.retail === null || dto.retail === '') {
        throw new BadRequestException('Medication retail is required');
      }
      data.retail = this.parseDecimal(dto.retail, 'retail');
    }

    if (Object.prototype.hasOwnProperty.call(dto, 'price')) {
      if (dto.price === null || dto.price === '') {
        throw new BadRequestException('Medication price is required');
      }
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

  private parseRequiredDecimal(
    value: number | string | null | undefined,
    fieldName: string,
  ) {
    const parsed = this.parseDecimal(value, fieldName);

    if (!parsed) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    return parsed;
  }

  private parsePositiveInteger(value: unknown, fieldName: string) {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`${fieldName} must be a positive integer`);
    }

    return parsed;
  }

  private parseItemType(value: string | null | undefined) {
    const normalized = value?.trim().toLowerCase();

    switch (normalized) {
      case 'medicine':
        return item_type_enum.medicine;
      case 'service':
        return item_type_enum.service;
      case 'lab':
        return item_type_enum.lab;
      case 'fee':
        return item_type_enum.fee;
      case undefined:
      case null:
      case '':
        return item_type_enum.medicine;
      default:
        throw new BadRequestException('itemType is invalid');
    }
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

  private buildAddress(
    address:
      | {
          detail?: string | null;
          sub_districts?: { name?: string | null } | null;
          districts?: { name?: string | null } | null;
          provinces?: { name?: string | null } | null;
          zip_codes?: { code?: string | null } | null;
        }
      | null
      | undefined,
  ) {
    if (!address) {
      return null;
    }

    const segments = [
      address.detail,
      address.sub_districts?.name,
      address.districts?.name,
      address.provinces?.name,
      address.zip_codes?.code,
    ]
      .filter(Boolean)
      .map((value) => value?.trim());

    return segments.length > 0 ? segments.join(', ') : null;
  }

  private mapOrderFormConsultation(
    consultation: Prisma.consultationsGetPayload<{
      include: {
        users_consultations_user_idTousers: {
          select: {
            user_id: true;
            name: true;
            sur_name: true;
            phone: true;
            medical_condition: true;
            allergy_drug: true;
            addresses: {
              select: {
                detail: true;
                sub_districts: { select: { name: true } };
                districts: { select: { name: true } };
                provinces: { select: { name: true } };
                zip_codes: { select: { code: true } };
              };
            };
          };
        };
        users_consultations_pharmacist_idTousers: {
          select: {
            user_id: true;
            name: true;
            sur_name: true;
          };
        };
        prescription_items: {
          include: {
            medications: {
              select: {
                id: true;
                name: true;
                retail: true;
              };
            };
          };
        };
        receipts: {
          select: {
            id: true;
            tracking: true;
            status: true;
          };
        };
      };
    }>,
  ): OrderFormConsultationDto {
    const patient = consultation.users_consultations_user_idTousers;
    const pharmacist = consultation.users_consultations_pharmacist_idTousers;

    return {
      consultationId: consultation.id,
      patientId: patient?.user_id ?? consultation.user_id ?? null,
      patientName: this.buildFullName(patient?.name, patient?.sur_name),
      patientPhone: patient?.phone ?? null,
      patientAddress: this.buildAddress(patient?.addresses),
      medicalCondition: patient?.medical_condition ?? null,
      allergyDrug: patient?.allergy_drug ?? null,
      pharmacistId: pharmacist?.user_id ?? consultation.pharmacist_id ?? null,
      pharmacistName: this.buildFullName(
        pharmacist?.name,
        pharmacist?.sur_name,
      ),
      note: consultation.note ?? null,
      createdAt: this.toIsoString(consultation.created_at),
      latestReceiptStatus: consultation.receipts[0]?.status ?? null,
      receiptCount: consultation.receipts.length,
      suggestedItems: consultation.prescription_items
        .filter((item) => item.medications?.id && item.medications?.name)
        .map((item) => ({
          medicationId: item.medications?.id ?? item.medication_id ?? null,
          medicationName: item.medications?.name ?? '-',
          quantity: item.quantity ?? 0,
          unitPrice: this.toNumber(item.medications?.retail),
          comment: item.comment ?? null,
        })),
    };
  }

  private async ensureReceiptsForConsultations() {
    const consultations = await this.prisma.consultations.findMany({
      where: {
        prescription_items: {
          some: {},
        },
      },
      select: { id: true },
    });

    for (const consultation of consultations) {
      await this.ensureReceiptForConsultation(consultation.id);
    }
  }

  private async ensureReceiptForConsultation(consultationId: number) {
    const existingReceipt = await this.prisma.receipts.findFirst({
      where: { consultation_id: consultationId },
      select: { id: true },
    });

    if (existingReceipt) {
      return existingReceipt.id;
    }

    const consultation = await this.prisma.consultations.findUnique({
      where: { id: consultationId },
      include: {
        users_consultations_user_idTousers: {
          select: {
            user_id: true,
          },
        },
        prescription_items: {
          orderBy: { id: 'asc' },
          include: {
            medications: {
              select: {
                id: true,
                name: true,
                retail: true,
              },
            },
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    const prescriptionItems = consultation.prescription_items.filter(
      (item) =>
        item.medications?.id &&
        item.medications?.name &&
        item.medications?.retail !== null &&
        item.quantity &&
        item.quantity > 0,
    );

    if (prescriptionItems.length === 0) {
      return null;
    }

    const normalizedItems = prescriptionItems.map((item, index) => {
      const medication = item.medications;
      const itemName = medication?.name?.trim() || '';
      const quantity = this.parsePositiveInteger(
        item.quantity,
        `items[${index}].quantity`,
      );
      const unitPrice = this.parseRequiredDecimal(
        this.toNumber(medication?.retail),
        `items[${index}].unitPrice`,
      );
      const totalPrice = new Prisma.Decimal(unitPrice.mul(quantity).toFixed(2));

      if (!itemName) {
        throw new BadRequestException(`items[${index}].itemName is required`);
      }

      return {
        medicationId: medication?.id ?? item.medication_id ?? null,
        itemName,
        itemType: 'medicine',
        quantity,
        unitPrice,
        totalPrice,
      };
    });

    const total = normalizedItems.reduce(
      (sum, item) => sum.plus(item.totalPrice),
      new Prisma.Decimal(0),
    );

    const receipt = await this.prisma.receipts.create({
      data: {
        consultation_id: consultation.id,
        user_id:
          consultation.users_consultations_user_idTousers?.user_id ??
          consultation.user_id ??
          null,
        status: receipt_status.pending_delivery,
        total,
        receipt_details: {
          create: normalizedItems.map((item) => ({
            item_name: item.itemName,
            item_type: this.parseItemType(item.itemType),
            medicine_id: item.medicationId,
            medicine_price: item.unitPrice,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.totalPrice,
          })),
        },
      },
      select: { id: true },
    });

    return receipt.id;
  }

  private mapOrderReceipt(
    receipt: Prisma.receiptsGetPayload<{
      include: {
        users: {
          select: {
            user_id: true;
            name: true;
            sur_name: true;
          };
        };
        receipt_details: {
          include: {
            medications: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        };
      };
    }>,
  ): OrderResponseDto {
    return {
      receiptId: receipt.id,
      consultationId: receipt.consultation_id ?? null,
      patientId: receipt.users?.user_id ?? receipt.user_id ?? null,
      patientName: this.buildFullName(
        receipt.users?.name,
        receipt.users?.sur_name,
      ),
      tracking: receipt.tracking ?? null,
      status: receipt.status ?? null,
      total: this.toNumber(receipt.total),
      createdAt: this.toIsoString(receipt.created_at),
      items: receipt.receipt_details.map((item) => ({
        receiptDetailId: item.id,
        medicationId: item.medicine_id ?? null,
        itemName: item.item_name ?? item.medications?.name ?? '-',
        itemType: item.item_type ?? null,
        quantity: item.quantity ?? 0,
        unitPrice: this.toNumber(item.unit_price),
        totalPrice: this.toNumber(item.total_price),
      })),
    };
  }

  private isPendingReceipt(
    tracking: string | null | undefined,
    status: string | null | undefined,
  ) {
    const normalizedStatus = status?.trim().toLowerCase() ?? null;

    return (
      !tracking &&
      normalizedStatus !== 'delivered' &&
      normalizedStatus !== 'picked_up' &&
      normalizedStatus !== 'cancelled'
    );
  }

  private resolveReceiptStatus(tracking: string | null, status: string | null) {
    if (tracking) {
      return receipt_status.delivered;
    }

    const normalizedStatus = status?.trim().toLowerCase() ?? null;

    if (normalizedStatus === 'pending_pickup') {
      return receipt_status.pending_pickup;
    }

    if (normalizedStatus === 'picked_up') {
      return receipt_status.picked_up;
    }

    if (normalizedStatus === 'cancelled') {
      return receipt_status.cancelled;
    }

    if (normalizedStatus === 'delivered') {
      return receipt_status.delivered;
    }

    return receipt_status.pending_delivery;
  }

  private buildDeliveryHistoryStatusFilter(status?: string | null) {
    const normalizedStatus = status?.trim().toLowerCase() ?? 'all';

    if (normalizedStatus === 'pending_delivery') {
      return {
        status: receipt_status.pending_delivery,
      };
    }

    if (normalizedStatus === 'pending_pickup') {
      return {
        status: receipt_status.pending_pickup,
      };
    }

    if (normalizedStatus === 'delivered') {
      return {
        status: receipt_status.delivered,
      };
    }

    if (normalizedStatus === 'picked_up') {
      return {
        status: receipt_status.picked_up,
      };
    }

    if (normalizedStatus === 'cancelled') {
      return {
        status: receipt_status.cancelled,
      };
    }

    return {
      status: {
        in: [
          receipt_status.delivered,
          receipt_status.picked_up,
          receipt_status.cancelled,
        ],
      },
    };
  }

  private toIsoString(value: Date | null | undefined) {
    return value ? value.toISOString() : null;
  }
}
