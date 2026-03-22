import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StaffHomeQueryDto } from './dto/staff-home-query.dto';
import { UpsertStaffScheduleDto } from './dto/upsert-staff-schedule.dto';
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

  @Post('schedule')
  upsertStaffSchedule(@Req() req, @Body() body: UpsertStaffScheduleDto) {
    this.ensureAdminAccess(req);
    return this.staffHomeService.upsertStaffSchedule(body);
  }

  private ensureStaffAccess(req): void {
    const roleId = Number(req?.user?.role_id);
    const allowedRoleIds = new Set([1, 3, 4, 5]);

    if (!allowedRoleIds.has(roleId)) {
      throw new ForbiddenException('Staff access only');
    }
  }

  private ensureAdminAccess(req): void {
    const roleId = Number(req?.user?.role_id);

    if (roleId !== 1) {
      throw new ForbiddenException('Admin access only');
    }
  }
}
