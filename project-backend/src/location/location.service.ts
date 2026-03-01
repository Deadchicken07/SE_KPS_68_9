import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async searchProvinces(q?: string) {
    return this.prisma.provinces.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 20,
    });
  }

  async searchDistricts(provinceId: number, q?: string) {
    return this.prisma.districts.findMany({
      where: {
        province_id: provinceId,
        ...(q && { name: { contains: q, mode: 'insensitive' } }),
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 20,
    });
  }

  async searchSubDistricts(districtId: number, q?: string) {
    return this.prisma.sub_districts.findMany({
      where: {
        district_id: districtId,
        ...(q && { name: { contains: q, mode: 'insensitive' } }),
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 20,
    });
  }
}
