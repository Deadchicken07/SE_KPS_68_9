import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  async findByNationId(nationId: string, name: string, surName: string) {
    const normalizedNationId = nationId.trim();
    const normalizedName = name.trim();
    const normalizedSurName = surName.trim();

    const user = await this.prisma.users.findFirst({
      where: {
        nation_id: normalizedNationId,
      },
      include: {
        currentAddress: {
          include: {
            province: true,
            district: true,
            subDistrict: true,
            zipCode: true,
          },
        },
        nationAddress: {
          include: {
            province: true,
            district: true,
            subDistrict: true,
            zipCode: true,
          },
        },
      },
    });

    // ⭐ ไม่มีเลขบัตรในระบบ
    if (!user) {
      return { status: 'new' };
    }

    // ⭐ เลขบัตรมี แต่ชื่อไม่ตรง
    if (
      user.name.trim() !== normalizedName ||
      user.sur_name.trim() !== normalizedSurName
    ) {
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

        currentAddress: user.currentAddress
          ? {
              provinceId: user.currentAddress.province_id,
              districtId: user.currentAddress.district_id,
              subDistrictId: user.currentAddress.sub_district_id,
              zipCodeId: user.currentAddress.zip_code_id,
              detail: user.currentAddress.detail,
            }
          : null,

        nationAddress: user.nationAddress
          ? {
              provinceId: user.nationAddress.province_id,
              districtId: user.nationAddress.district_id,
              subDistrictId: user.nationAddress.sub_district_id,
              zipCodeId: user.nationAddress.zip_code_id,
              detail: user.nationAddress.detail,
            }
          : null,
      },
    };
  }
  async checkEmail(email: string) {
    if (!email || !email.trim()) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.prisma.users.findUnique({
      where: { email: email.trim().toLowerCase() },
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
