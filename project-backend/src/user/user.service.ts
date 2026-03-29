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
import { CreateStaffDto } from './dto/create-staff.dto';
import * as bcrypt from 'bcrypt';
import {
  normalizeEmail,
  normalizeOptionalText,
} from '../common/utils/normalize-input';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  private buildPatientCode(userId: number) {
    return `PT-${userId.toString().padStart(6, '0')}`;
  }

  private mapProfile(user: {
    user_id: number;
    name: string;
    sur_name: string;
    phone: string | null;
    email: string | null;
    medical_condition: string | null;
    allergy_drug: string | null;
    addresses: { detail: string | null } | null;
    addresses_users_address_id_nationToaddresses: { detail: string | null } | null;
  }): UserProfileResponseDto {
    return {
      patientCode: this.buildPatientCode(user.user_id),
      firstName: user.name,
      lastName: user.sur_name,
      phone: user.phone ?? '',
      email: user.email ?? '',
      chronicDisease: user.medical_condition ?? '',
      allergies: user.allergy_drug ?? '',
      currentAddress: user.addresses?.detail ?? '',
      shippingAddress:
        user.addresses_users_address_id_nationToaddresses?.detail ?? '',
    };
  }

  async findAll(query: UserQueryDto): Promise<PaginatedUserResponse> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search?.trim() ?? '';
    const skip = (page - 1) * limit;

    const where: Prisma.usersWhereInput = {
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
      ...(query.roleId ? { role_id: Number(query.roleId) } : {})
    };

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

  async findAllUser(){
    const user = await this.prisma.users.findMany({
      where: {
        role_id : 2
      },
      select: {
        user_id : true,
        name: true,
        sur_name: true,
      }
    })

    return user;
  }

  async getMyProfile(userId: number): Promise<UserProfileResponseDto> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        sur_name: true,
        phone: true,
        email: true,
        medical_condition: true,
        allergy_drug: true,
        addresses: {
          select: {
            detail: true,
          },
        },
        addresses_users_address_id_nationToaddresses: {
          select: {
            detail: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapProfile(user);
  }

  async updateMyProfile(
    userId: number,
    body: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();

    if (!firstName || !lastName) {
      throw new BadRequestException('First name and last name are required');
    }

    try {
      const user = await this.prisma.$transaction(async (prisma) => {
        const existingUser = await prisma.users.findUnique({
          where: { user_id: userId },
          select: {
            user_id: true,
            address_id: true,
            address_id_nation: true,
          },
        });

        if (!existingUser) {
          throw new NotFoundException('User not found');
        }

        const currentAddressDetail = normalizeOptionalText(body.currentAddress);
        const shippingAddressDetail = normalizeOptionalText(body.shippingAddress);

        let currentAddressId = existingUser.address_id ?? null;
        let shippingAddressId = existingUser.address_id_nation ?? null;

        if (currentAddressDetail) {
          if (currentAddressId) {
            await prisma.addresses.update({
              where: { id: currentAddressId },
              data: { detail: currentAddressDetail },
            });
          } else {
            const address = await prisma.addresses.create({
              data: { detail: currentAddressDetail },
            });
            currentAddressId = address.id;
          }
        }

        if (shippingAddressDetail) {
          if (shippingAddressId) {
            await prisma.addresses.update({
              where: { id: shippingAddressId },
              data: { detail: shippingAddressDetail },
            });
          } else {
            const address = await prisma.addresses.create({
              data: { detail: shippingAddressDetail },
            });
            shippingAddressId = address.id;
          }
        }

        return prisma.users.update({
          where: { user_id: userId },
          data: {
            name: firstName,
            sur_name: lastName,
            phone: normalizeOptionalText(body.phone),
            email: body.email ? normalizeEmail(body.email) : null,
            medical_condition: normalizeOptionalText(body.chronicDisease),
            allergy_drug: normalizeOptionalText(body.allergies),
            address_id: currentAddressId,
            address_id_nation: shippingAddressId,
          },
          select: {
            user_id: true,
            name: true,
            sur_name: true,
            phone: true,
            email: true,
            medical_condition: true,
            allergy_drug: true,
            addresses: {
              select: {
                detail: true,
              },
            },
            addresses_users_address_id_nationToaddresses: {
              select: {
                detail: true,
              },
            },
          },
        });
      });

      return this.mapProfile(user);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Email already exists');
      }

      throw error;
    }
  }

  async findStaffs() {
    const staffs = await this.prisma.users.findMany({
      where: {
        roles: {
          name: {
            in: ['psychiatrist', 'psychologist'],
          },
        },
      },
      select: {
        user_id: true,
        name: true,
        sur_name: true,
        file_name: true,
        info: true,
        role_id: true,
        roles: {
          select: {
            name: true,
            fee_id: true,
          },
        },
      },
    });

    // Fetch all relevant fees in one query
    const feeIds = staffs
      .map((s) => s.roles?.fee_id)
      .filter((id): id is number => id != null);
    const fees = feeIds.length
      ? await this.prisma.fees.findMany({ where: { id: { in: feeIds } } })
      : [];
    const feeMap = new Map(fees.map((f) => [f.id, Number(f.price_per_hours ?? 0)]));

    return staffs.map((staff) => {
      let roleThai = staff.roles?.name || '';
      if (roleThai === 'psychiatrist') roleThai = 'จิตแพทย์';
      else if (roleThai === 'psychologist') roleThai = 'นักจิตวิทยา';

      const pricePerHour = staff.roles?.fee_id
        ? (feeMap.get(staff.roles.fee_id) ?? 0)
        : 0;

      return {
        id: staff.user_id,
        name: `${staff.name} ${staff.sur_name}`,
        role: roleThai,
        specialty: staff.info || '',
        image: staff.file_name || '',
        pricePerHour,
      };
    });
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
            provinceId: user.addresses.province_id,
            districtId: user.addresses.district_id,
            subDistrictId: user.addresses.sub_district_id,
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

  async findStaffById(staffId: number) {
    const staff = await this.prisma.users.findUnique({
      where: {
        user_id: staffId,
        roles: {
          name: {
            in: ['psychiatrist', 'psychologist'],
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

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    let roleThai = staff.roles?.name || '';
    if (roleThai === 'psychiatrist') roleThai = 'จิตแพทย์';
    else if (roleThai === 'psychologist') roleThai = 'นักจิตวิทยา';

    return {
      id: staff.user_id,
      name: `${staff.name} ${staff.sur_name}`,
      role: roleThai,
      specialty: staff.info || '',
      image: staff.file_name || '',
    };
  }

  async createStaff(body: CreateStaffDto, adminId?: number) {
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const staff = await this.prisma.users.create({
      data: {
        email: body.email,
        name: body.name,
        sur_name: body.surName,
        password_hash: hashedPassword,
        role_id: body.roleId,
        phone: body.phone,
        info: body.info,
        degree: body.degree,
        license: body.license,
        file_name: body.fileName,
        title: body.title,
        status: 'ACTIVE',
        created_by: adminId,
      },
    });

    return {
      message: 'Staff created successfully',
      staffId: staff.user_id,
    };
  }
}
