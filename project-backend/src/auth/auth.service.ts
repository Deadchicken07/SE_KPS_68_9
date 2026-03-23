import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateDoctorDto, RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Prisma } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import {
  normalizeEmail,
  normalizeOptionalText,
} from '../common/utils/normalize-input';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(email: string, password: string) {
    const normalizedEmail = normalizeEmail(email);

    const user =
      (await this.prisma.users.findUnique({
        where: { email: normalizedEmail },
      })) ?? (await this.resolveDemoUser(normalizedEmail, password));

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isDemoLogin = user.email !== normalizedEmail;

    if (!isDemoLogin && !user.password_hash) {
      throw new UnauthorizedException('Password not set');
    }

    if (!isDemoLogin) {
      const isMatch = await bcrypt.compare(password, user.password_hash!);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid password');
      }
    }

    const payload = {
      sub: user.user_id,
      email: user.email,
      role_id: user.role_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async resolveDemoUser(email: string, password: string) {
    if (process.env.ENABLE_DEMO_AUTH !== 'true') {
      return null;
    }

    const demoPassword = process.env.DEMO_LOGIN_PASSWORD;

    if (!demoPassword || password !== demoPassword) {
      return null;
    }

    const requestedRoleId = this.getDemoRoleId(email);

    if (!requestedRoleId) {
      return null;
    }

    const candidates = await this.prisma.users.findMany({
      where: {
        role_id: requestedRoleId,
        status: 'ACTIVE',
      },
      select: {
        user_id: true,
        email: true,
        role_id: true,
        password_hash: true,
        _count: {
          select: {
            appointments_appointments_staff_idTousers: true,
            consultations_consultations_staff_idTousers: true,
            schedule: true,
          },
        },
      },
    });

    if (!candidates.length) {
      return null;
    }

    const representative = [...candidates].sort((left, right) => {
      const leftScore =
        left._count.appointments_appointments_staff_idTousers +
        left._count.consultations_consultations_staff_idTousers +
        left._count.schedule;
      const rightScore =
        right._count.appointments_appointments_staff_idTousers +
        right._count.consultations_consultations_staff_idTousers +
        right._count.schedule;

      return rightScore - leftScore || left.user_id - right.user_id;
    })[0];

    return this.prisma.users.findUnique({
      where: { user_id: representative.user_id },
    });
  }

  private getDemoRoleId(email: string) {
    const psychiatristEmail = normalizeOptionalText(
      process.env.DEMO_PSYCHIATRIST_EMAIL,
    )?.toLowerCase();
    const psychologistEmail = normalizeOptionalText(
      process.env.DEMO_PSYCHOLOGIST_EMAIL,
    )?.toLowerCase();

    if (email === psychiatristEmail) {
      return 4;
    }

    if (email === psychologistEmail) {
      return 3;
    }

    return null;
  }

  async getMe(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        email: true,
        role_id: true,
        name: true,
        sur_name: true,
        file_name: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      sub: user.user_id,
      email: user.email,
      role_id: user.role_id,
      name: user.name,
      sur_name: user.sur_name,
      file_name: user.file_name,
    };
  }

  async register(body: RegisterDto) {
    try {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const normalizedEmail = normalizeEmail(body.email);
      const normalizedName = body.name.trim();
      const normalizedSurName = body.surName.trim();
      const normalizedTitle = normalizeOptionalText(body.title);
      const normalizedPhone = normalizeOptionalText(body.phone);
      const normalizedNationId = normalizeOptionalText(body.nationId);
      const normalizedMedicalCondition = normalizeOptionalText(
        body.medicalCondition,
      );
      const normalizedAllergyDrug = normalizeOptionalText(body.allergyDrug);

      const result = await this.prisma.$transaction(
        async (prisma) => {
          const existingUser = normalizedNationId
            ? await prisma.users.findUnique({
                where: { nation_id: normalizedNationId },
              })
            : null;

          if (existingUser && existingUser.email) {
            throw new BadRequestException('บัญชีนี้สมัครแล้ว');
          }

          const address = await prisma.addresses.create({
            data: {
              province_id: body.address.provinceId,
              district_id: body.address.districtId,
              sub_district_id: body.address.subDistrictId,
              detail: body.address.detail,
              zip_code_id: body.address.zipCodeId
                ? Number(body.address.zipCodeId)
                : null,
            },
          });

          let addressNationId: number | null = null;

          if (body.addressNation) {
            const addressNation = await prisma.addresses.create({
              data: {
                province_id: body.addressNation.provinceId,
                district_id: body.addressNation.districtId,
                sub_district_id: body.addressNation.subDistrictId,
                detail: body.addressNation.detail,
                zip_code_id: body.addressNation.zipCodeId
                  ? Number(body.addressNation.zipCodeId)
                  : null,
              },
            });

            addressNationId = addressNation.id;
          }

          if (existingUser) {
            return prisma.users.update({
              where: { user_id: existingUser.user_id },
              data: {
                email: normalizedEmail,
                name: normalizedName,
                sur_name: normalizedSurName,
                title: normalizedTitle,
                phone: normalizedPhone,
                medical_condition: normalizedMedicalCondition,
                allergy_drug: normalizedAllergyDrug,
                address_id: address.id,
                address_id_nation: addressNationId,
                role_id: 2,
                password_hash: hashedPassword,
              },
            });
          }

          return prisma.users.create({
            data: {
              email: normalizedEmail,
              name: normalizedName,
              sur_name: normalizedSurName,
              title: normalizedTitle,
              phone: normalizedPhone,
              nation_id: normalizedNationId,
              medical_condition: normalizedMedicalCondition,
              allergy_drug: normalizedAllergyDrug,
              address_id: address.id,
              address_id_nation: addressNationId,
              role_id: 2,
              password_hash: hashedPassword,
            },
          });
        },
        {
          maxWait: 10000,
          timeout: 20000,
        },
      );

      return {
        message: 'Register success',
        userId: result.user_id,
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Email นี้ถูกใช้งานแล้ว');
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2028'
      ) {
        throw new BadRequestException(
          'ระบบฐานข้อมูลไม่ตอบสนอง กรุณาลองใหม่อีกครั้ง',
        );
      }

      throw error;
    }
  }

  async createDoctor(body: CreateDoctorDto, adminId: number) {
    const hashedPassword = await bcrypt.hash(body.password, 10);

    await this.prisma.users.create({
      data: {
        email: normalizeEmail(body.email),
        name: body.name.trim(),
        sur_name: body.surName.trim(),
        degree: body.degree.trim(),
        license: body.license.trim(),
        info: normalizeOptionalText(body.info),
        file_name: normalizeOptionalText(body.fileName),
        status: normalizeOptionalText(body.status) ?? 'ACTIVE',
        role_id: 2,
        created_by: adminId,
        password_hash: hashedPassword,
      },
    });

    return {
      message: 'Doctor created successfully',
    };
  }

  async changePassword(dto: ChangePasswordDto, userId: number) {
    const { oldPassword, newPassword } = dto;

    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.users.update({
      where: { user_id: userId },
      data: {
        password_hash: hashedPassword,
      },
    });

    return { message: 'Password changed successfully' };
  }

  async resetPasswordByOtp(email: string, newPassword: string) {
    const normalizedEmail = normalizeEmail(email);
    this.mailService.consumeVerifiedEmail(normalizedEmail);

    const user = await this.prisma.users.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new BadRequestException('Email not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.users.update({
      where: { user_id: user.user_id },
      data: {
        password_hash: hashedPassword,
      },
    });

    return { message: 'Password reset successfully' };
  }
}
