import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeleteStaffScheduleDto } from '../staff-home/dto/delete-staff-schedule.dto';
import { StaffHomeQueryDto } from '../staff-home/dto/staff-home-query.dto';
import { UpsertStaffScheduleDto } from '../staff-home/dto/upsert-staff-schedule.dto';
import { StaffHomeService } from '../staff-home/staff-home.service';
import { PhamaHomeService } from './phama-home.service';

@Controller('phama-home')
@UseGuards(JwtAuthGuard)
export class PhamaHomeController {
  constructor(
    private readonly phamaHomeService: PhamaHomeService,
    private readonly staffHomeService: StaffHomeService,
  ) {}

  @Get('orders')
  getOrders(@Req() req) {
    const auth = this.getAuthContext(req);
    this.ensurePharmacistAccess(auth.roleId);
    return this.phamaHomeService.getOrders(auth.userId, auth.roleId);
  }

  @Get('clinic-schedule')
  getClinicSchedule(@Req() req, @Query() query: StaffHomeQueryDto) {
    const auth = this.getAuthContext(req);
    this.ensurePharmacistAccess(auth.roleId);
    return this.staffHomeService.getClinicSchedule(query);
  }

  @Post('schedule')
  upsertStaffSchedule(@Req() req, @Body() body: UpsertStaffScheduleDto) {
    const auth = this.getAuthContext(req);
    this.ensurePharmacistAccess(auth.roleId);
    return this.staffHomeService.upsertStaffSchedule(
      this.resolveScheduleInput(auth, body),
    );
  }

  @Delete('schedule')
  deleteStaffSchedule(@Req() req, @Body() body: DeleteStaffScheduleDto) {
    const auth = this.getAuthContext(req);
    this.ensurePharmacistAccess(auth.roleId);
    return this.staffHomeService.deleteStaffSchedule(
      this.resolveScheduleInput(auth, body),
    );
  }

  @Patch('orders/:consultationId/status')
  updateOrderStatus(
    @Req() req,
    @Param('consultationId', ParseIntPipe) consultationId: number,
    @Body() body: { status?: string; tracking?: string },
  ) {
    const auth = this.getAuthContext(req);
    this.ensurePharmacistAccess(auth.roleId);
    return this.phamaHomeService.updateOrderStatus(
      consultationId,
      auth.userId,
      auth.roleId,
      body?.status,
      body?.tracking,
    );
  }

  private getAuthContext(req): { userId: number; roleId: number } {
    const userId = Number(req?.user?.sub);
    const roleId = Number(req?.user?.role_id);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (!Number.isInteger(roleId) || roleId <= 0) {
      throw new UnauthorizedException('Invalid role payload');
    }

    return { userId, roleId };
  }

  private ensurePharmacistAccess(roleId: number) {
    const allowedRoleIds = new Set([1, 5]);

    if (!allowedRoleIds.has(roleId)) {
      throw new ForbiddenException('Pharmacist access only');
    }
  }

  private resolveScheduleInput<T extends { staffId?: number }>(
    auth: { userId: number; roleId: number },
    body: T,
  ): T & { staffId: number } {
    if (auth.roleId === 1) {
      return body as T & { staffId: number };
    }

    if (body?.staffId != null && Number(body.staffId) !== auth.userId) {
      throw new ForbiddenException('You can only update your own schedule');
    }

    return {
      ...body,
      staffId: auth.userId,
    };
  }
}
