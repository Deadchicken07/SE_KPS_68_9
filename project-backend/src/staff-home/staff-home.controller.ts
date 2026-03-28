import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminReportQueryDto } from './dto/admin-report-query.dto';
import { DeleteStaffScheduleDto } from './dto/delete-staff-schedule.dto';
import { DeleteClinicHolidayDto } from './dto/delete-clinic-holiday.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StaffHomeQueryDto } from './dto/staff-home-query.dto';
import { UpsertStaffScheduleDto } from './dto/upsert-staff-schedule.dto';
import { UpsertClinicHolidayDto } from './dto/upsert-clinic-holiday.dto';
import { StaffHomeService } from './staff-home.service';

@Controller('staff-home')
@UseGuards(JwtAuthGuard)
export class StaffHomeController {
  constructor(private readonly staffHomeService: StaffHomeService) {}

  @Get('clinic-schedule')
  getClinicSchedule(@Req() req, @Query() query: StaffHomeQueryDto) {
    this.ensureStaffAccess(req);
    return this.staffHomeService.getClinicSchedule(query);
  }

  @Get('admin-report')
  getAdminReport(@Req() req, @Query() query: AdminReportQueryDto) {
    this.ensureAdminAccess(req);
    return this.staffHomeService.getAdminReport(query);
  }

  @Post('schedule')
  upsertStaffSchedule(@Req() req, @Body() body: UpsertStaffScheduleDto) {
    return this.staffHomeService.upsertStaffSchedule(
      this.resolveScheduleWriteInput(req, body),
    );
  }

  @Delete('schedule')
  deleteStaffSchedule(@Req() req, @Body() body: DeleteStaffScheduleDto) {
    return this.staffHomeService.deleteStaffSchedule(
      this.resolveScheduleDeleteInput(req, body),
    );
  }

  @Post('clinic-holiday')
  upsertClinicHoliday(@Req() req, @Body() body: UpsertClinicHolidayDto) {
    this.ensureAdminAccess(req);
    return this.staffHomeService.upsertClinicHoliday(body);
  }

  @Delete('clinic-holiday')
  deleteClinicHoliday(@Req() req, @Body() body: DeleteClinicHolidayDto) {
    this.ensureAdminAccess(req);
    return this.staffHomeService.deleteClinicHoliday(body);
  }

  private ensureStaffAccess(req): void {
    const roleId = Number(req?.user?.role_id);
    const allowedRoleIds = new Set([1, 3, 4, 5]);

    if (!allowedRoleIds.has(roleId)) {
      throw new ForbiddenException('Staff access only');
    }
  }

  private ensureAdminAccess(req): void {
    if (Number(req?.user?.role_id) !== 1) {
      throw new ForbiddenException('Admin access only');
    }
  }

  private resolveScheduleWriteInput(
    req,
    body: UpsertStaffScheduleDto,
  ): UpsertStaffScheduleDto {
    return {
      ...body,
      staffId: this.resolveScheduleStaffId(req, body?.staffId),
    };
  }

  private resolveScheduleDeleteInput(
    req,
    body: DeleteStaffScheduleDto,
  ): DeleteStaffScheduleDto {
    return {
      ...body,
      staffId: this.resolveScheduleStaffId(req, body?.staffId),
    };
  }

  private resolveScheduleStaffId(req, requestedStaffId?: number): number {
    const roleId = Number(req?.user?.role_id);
    const currentUserId = Number(req?.user?.sub);

    if (roleId === 1) {
      return Number(requestedStaffId);
    }

    const selfManageRoleIds = new Set([3, 4, 5]);

    if (!selfManageRoleIds.has(roleId)) {
      throw new ForbiddenException('Staff access only');
    }

    if (!Number.isInteger(currentUserId) || currentUserId <= 0) {
      throw new ForbiddenException('Staff access only');
    }

    if (
      requestedStaffId != null &&
      Number(requestedStaffId) !== currentUserId
    ) {
      throw new ForbiddenException('You can only update your own schedule');
    }

    return currentUserId;
  }
}
