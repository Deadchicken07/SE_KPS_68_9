import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  normalizeEmail,
  normalizeOptionalText,
} from '../common/utils/normalize-input';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminStaffDto } from './dto/create-admin-staff.dto';
import { StaffManagementQueryDto } from './dto/staff-management-query.dto';
import { UpdateAdminStaffDto } from './dto/update-admin-staff.dto';

@Injectable()
export class AdminStaffManagementService {
  private readonly manageableStaffRoleIds = [3, 4, 5] as const;

  constructor(private readonly prisma: PrismaService) {}

  private buildFullName(firstName: string | null | undefined, lastName: string | null | undefined) {
    return [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ').trim();
  }

  private isManageableStaffRoleId(roleId: number | null | undefined) {
    return this.manageableStaffRoleIds.includes(roleId as 3 | 4 | 5);
  }

  private toRoleLabel(roleId: number | null | undefined) {
    switch (roleId) {
      case 3:
        return 'นักจิตวิทยา';
      case 4:
        return 'จิตแพทย์';
      case 5:
        return 'เภสัชกร';
      default:
        return '';
    }
  }

  private normalizeStatus(
    value: string | null | undefined,
    fallback: 'ACTIVE' | 'INACTIVE' = 'ACTIVE',
  ) {
    const normalized = value?.trim().toUpperCase();

    if (!normalized) {
      return fallback;
    }

    if (normalized !== 'ACTIVE' && normalized !== 'INACTIVE') {
      throw new BadRequestException('Invalid staff status');
    }

    return normalized;
  }

  private async findManagedStaffById(staffId: number) {
    if (!Number.isInteger(staffId) || staffId <= 0) {
      throw new BadRequestException('Invalid staff id');
    }

    const staff = await this.prisma.users.findFirst({
      where: {
        user_id: staffId,
        role_id: {
          in: [...this.manageableStaffRoleIds],
        },
      },
      select: {
        user_id: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  async findAll(query: StaffManagementQueryDto) {
    const search = query.search?.trim() ?? '';
    const normalizedStatus = normalizeOptionalText(query.status)?.toUpperCase() ?? null;

    const where: Prisma.usersWhereInput = {
      role_id: {
        in: [...this.manageableStaffRoleIds],
      },
      ...(normalizedStatus ? { status: normalizedStatus } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sur_name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { info: { contains: search, mode: 'insensitive' } },
              { degree: { contains: search, mode: 'insensitive' } },
              { license: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const staffs = await this.prisma.users.findMany({
      where,
      orderBy: [{ status: 'asc' }, { user_id: 'asc' }],
      select: {
        user_id: true,
        name: true,
        sur_name: true,
        email: true,
        role_id: true,
        phone: true,
        info: true,
        degree: true,
        license: true,
        file_name: true,
        status: true,
        created_at: true,
      },
    });

    return staffs.map((staff) => ({
      id: staff.user_id,
      name: staff.name,
      surName: staff.sur_name,
      fullName: this.buildFullName(staff.name, staff.sur_name),
      email: staff.email,
      roleId: staff.role_id,
      roleName: this.toRoleLabel(staff.role_id),
      phone: staff.phone,
      info: staff.info,
      degree: staff.degree,
      license: staff.license,
      fileName: staff.file_name,
      status: staff.status?.toUpperCase() ?? 'ACTIVE',
      createdAt: staff.created_at?.toISOString() ?? null,
    }));
  }

  async create(body: CreateAdminStaffDto, adminId?: number) {
    const email = normalizeEmail(body.email);
    const name = body.name?.trim();
    const surName = body.surName?.trim();
    const password = body.password?.trim();

    if (!email || !name || !surName || !password) {
      throw new BadRequestException(
        'Email, first name, last name and password are required',
      );
    }

    if (!this.isManageableStaffRoleId(body.roleId)) {
      throw new BadRequestException('Invalid staff role');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const staff = await this.prisma.users.create({
        data: {
          email,
          name,
          sur_name: surName,
          password_hash: hashedPassword,
          role_id: body.roleId,
          phone: normalizeOptionalText(body.phone),
          info: normalizeOptionalText(body.info),
          degree: normalizeOptionalText(body.degree),
          license: normalizeOptionalText(body.license),
          file_name: normalizeOptionalText(body.fileName),
          status: this.normalizeStatus(body.status),
          created_by: adminId,
        },
      });

      return {
        message: 'Staff created successfully',
        staffId: staff.user_id,
      };
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

  async update(staffId: number, body: UpdateAdminStaffDto) {
    await this.findManagedStaffById(staffId);

    const data: Prisma.usersUncheckedUpdateInput = {};

    if (body.email !== undefined) {
      const email = normalizeEmail(body.email);

      if (!email) {
        throw new BadRequestException('Email is required');
      }

      data.email = email;
    }

    if (body.name !== undefined) {
      const name = body.name.trim();

      if (!name) {
        throw new BadRequestException('First name is required');
      }

      data.name = name;
    }

    if (body.surName !== undefined) {
      const surName = body.surName.trim();

      if (!surName) {
        throw new BadRequestException('Last name is required');
      }

      data.sur_name = surName;
    }

    if (body.roleId !== undefined) {
      if (!this.isManageableStaffRoleId(body.roleId)) {
        throw new BadRequestException('Invalid staff role');
      }

      data.role_id = body.roleId;
    }

    if (body.password !== undefined) {
      const password = body.password.trim();

      if (password) {
        data.password_hash = await bcrypt.hash(password, 10);
      }
    }

    if (body.phone !== undefined) {
      data.phone = normalizeOptionalText(body.phone);
    }

    if (body.info !== undefined) {
      data.info = normalizeOptionalText(body.info);
    }

    if (body.degree !== undefined) {
      data.degree = normalizeOptionalText(body.degree);
    }

    if (body.license !== undefined) {
      data.license = normalizeOptionalText(body.license);
    }

    if (body.fileName !== undefined) {
      data.file_name = normalizeOptionalText(body.fileName);
    }

    if (body.status !== undefined) {
      data.status = this.normalizeStatus(body.status);
    }

    if (!Object.keys(data).length) {
      return { message: 'No changes provided' };
    }

    try {
      await this.prisma.users.update({
        where: { user_id: staffId },
        data,
      });

      return {
        message: 'Staff updated successfully',
      };
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

  async deactivate(staffId: number) {
    await this.findManagedStaffById(staffId);

    await this.prisma.users.update({
      where: { user_id: staffId },
      data: {
        status: 'INACTIVE',
      },
    });

    return {
      message: 'Staff deactivated successfully',
    };
  }
}
