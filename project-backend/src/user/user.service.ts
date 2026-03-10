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

  async findStaffs() {
    const staffs = await this.prisma.users.findMany({
      where: {
        roles: {
          name: {
            in: ['จิตแพทย์', 'นักจิตวิทยา'],
          },
        },
      },
      select: {
        user_id: true,
        name: true,
        sur_name: true,
        file_name: true,
        info: true,
        roles: {
          select: {
            name: true,
          },
        },
      },
    });

    return staffs.map((staff) => ({
      id: staff.user_id,
      name: `${staff.name} ${staff.sur_name}`,
      role: staff.roles?.name || '',
      specialty: staff.info || '',
      image: staff.file_name || '',
    }));
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
  async findByNationId(nationId: string, name: string, surName: string) {
    const user = await this.prisma.users.findFirst({
      where: {
        nation_id: nationId,
      },
      include: {
        addresses: {
          include: {
            provinces: true,
            districts: true,
            sub_districts: true,
            zip_codes: true,
          },
        },
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

    // ⭐ ไม่มีเลขบัตรในระบบ
    if (!user) {
      return { status: 'new' };
    }

    // ⭐ เลขบัตรมี แต่ชื่อไม่ตรง
    if (user.name !== name || user.sur_name !== surName) {
      return { status: 'mismatch' };
    }

    // ⭐ สมัครแล้ว
    if (user.email) {
      return { status: 'completed' };
    }

    // ⭐ มีข้อมูลแต่ยังสมัครไม่เสร็จ
    return {
      status: 'incomplete',
      data: {
        id: user.user_id,
        name: user.name,
        surName: user.sur_name,
        title: user.title,
        email: user.email,
        phone: user.phone,
        nationId: user.nation_id,
        medicalCondition: user.medical_condition,
        allergyDrug: user.allergy_drug,

        currentAddress: user.addresses
          ? {
              provinceId:
                user.addresses.province_id,
              districtId:
                user.addresses.district_id,
              subDistrictId:
                user.addresses.sub_district_id,
              zipCodeId: user.addresses.zip_code_id,
              detail: user.addresses.detail,
            }
          : null,

        nationAddress: user.addresses_users_address_id_nationToaddresses
          ? {
              provinceId:
                user.addresses_users_address_id_nationToaddresses.province_id,
              districtId:
                user.addresses_users_address_id_nationToaddresses.district_id,
              subDistrictId:
                user.addresses_users_address_id_nationToaddresses
                  .sub_district_id,
              zipCodeId:
                user.addresses_users_address_id_nationToaddresses.zip_code_id,
              detail: user.addresses_users_address_id_nationToaddresses.detail,
            }
          : null,
      },
    };
  }
  async checkEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (user) {
      return {
        exists: true,
        message: 'Email already exists',
      };
    }

    return {
      exists: false,
    };
  }
}
