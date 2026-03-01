import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginatedUserResponse,
  UserResponseDto,
} from './dto/user-response.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: UserQueryDto): Promise<PaginatedUserResponse> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search?.trim() ?? '';
    const skip = (page - 1) * limit;

    const where: Prisma.usersWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { user_id: 'desc' }, // ✅ ใช้ user_id
        select: {
          user_id: true,
          name: true,
          email: true,
        },
      }),
      this.prisma.users.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        userId: u.user_id,
        name: u.name,
        email: u.email,
      })),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
  async findOne(userId: number): Promise<UserResponseDto> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId }, // ✅ ตรง schema
      select: {
        user_id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user.user_id,
      name: user.name,
      email: user.email,
    };
  }
  async findByNationId(nationId: string) {
    const user = await this.prisma.users.findUnique({
      where: { nation_id: nationId },
      include: {
        // address ปัจจุบัน
        addresses: {
          include: {
            provinces: true,
            districts: true,
            sub_districts: true,
            zip_codes: true,
          },
        },

        // address ตามบัตร
        addresses_users_address_id_nationToaddresses: {
          include: {
            provinces: true,
            districts: true,
            sub_districts: true,
            zip_codes: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.user_id, // เพราะ schema ใช้ user_id_
      name: user.name,
      surName: user.sur_name,
      phone: user.phone,
      nationId: user.nation_id,
      medicalCondition: user.medical_condition,
      allergyDrug: user.allergy_drug,

      // ที่อยู่ปัจจุบัน
      currentAddress: user.addresses
        ? {
            provinceId: user.addresses.province_id,
            provinceName: user.addresses.provinces?.name,
            districtId: user.addresses.district_id,
            districtName: user.addresses.districts?.name,
            subDistrictId: user.addresses.sub_district_id,
            subDistrictName: user.addresses.sub_districts?.name,
            zipCodeId: user.addresses.zip_code_id,
            zipCode: user.addresses.zip_codes?.code,
            detail: user.addresses.detail,
          }
        : null,

      // ที่อยู่ตามบัตร
      nationAddress: user.addresses_users_address_id_nationToaddresses
        ? {
            provinceId:
              user.addresses_users_address_id_nationToaddresses.province_id,
            provinceName:
              user.addresses_users_address_id_nationToaddresses.provinces?.name,
            districtId:
              user.addresses_users_address_id_nationToaddresses.district_id,
            districtName:
              user.addresses_users_address_id_nationToaddresses.districts?.name,
            subDistrictId:
              user.addresses_users_address_id_nationToaddresses.sub_district_id,
            subDistrictName:
              user.addresses_users_address_id_nationToaddresses.sub_districts
                ?.name,
            zipCodeId:
              user.addresses_users_address_id_nationToaddresses.zip_code_id,
            zipCode:
              user.addresses_users_address_id_nationToaddresses.zip_codes?.code,
            detail: user.addresses_users_address_id_nationToaddresses.detail,
          }
        : null,
    };
  }
}
