import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

      const user = await this.prisma.users.create({
        data: {
          email: body.email,
          name: body.name,
          sur_name: body.surName,
          phone: body.phone ?? null,
          nation_id: body.nationId ?? null,
          medical_condition: body.medicalCondition ?? null,
          allergy_drug: body.allergyDrug ?? null,
          address_id: body.addressId ?? null,
          role_id: body.roleId ?? 1,
          password_hash: hashedPassword,
        },
      });

      return {
        message: 'Register success',
        user,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email or Nation ID already exists');
      }
      throw error;
    }
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
  ฌ;
}
