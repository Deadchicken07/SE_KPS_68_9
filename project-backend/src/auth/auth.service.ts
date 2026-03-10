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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Password not set');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
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

  async register(body: RegisterDto) {
    try {
      const hashedPassword = await bcrypt.hash(body.password, 10);

      const result = await this.prisma.$transaction(
        async (prisma) => {
          const existingUser = body.nationId
            ? await prisma.users.findUnique({
                where: { nation_id: body.nationId },
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
                email: body.email,
                name: body.name,
                sur_name: body.surName,
                title: body.title ?? null,
                phone: body.phone ?? null,
                medical_condition: body.medicalCondition ?? null,
                allergy_drug: body.allergyDrug ?? null,
                address_id: address.id,
                address_id_nation: addressNationId,
                password_hash: hashedPassword,
              },
            });
          }

          return prisma.users.create({
            data: {
              email: body.email,
              name: body.name,
              sur_name: body.surName,
              title: body.title ?? null,
              phone: body.phone ?? null,
              nation_id: body.nationId ?? null,
              medical_condition: body.medicalCondition ?? null,
              allergy_drug: body.allergyDrug ?? null,
              address_id: address.id,
              address_id_nation: addressNationId,
              role_id: 1,
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
        email: body.email,
        name: body.name,
        sur_name: body.surName,
        degree: body.degree,
        license: body.license,
        info: body.info ?? null,
        file_name: body.fileName ?? null,
        status: body.status ?? 'ACTIVE',
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
    const normalizedEmail = email.trim().toLowerCase();
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
