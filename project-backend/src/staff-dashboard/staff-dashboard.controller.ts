import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StaffDashboardQueryDto } from './dto/staff-dashboard-query.dto';
import { StaffDashboardService } from './staff-dashboard.service';

@Controller('staff-dashboard')
@UseGuards(JwtAuthGuard)
export class StaffDashboardController {
  constructor(
    private readonly staffDashboardService: StaffDashboardService,
  ) {}

  @Get('clinic-schedule')
  getClinicSchedule(@Req() req, @Query() query: StaffDashboardQueryDto) {
    this.ensureStaffAccess(req);
    return this.staffDashboardService.getClinicSchedule(query);
  }

  private ensureStaffAccess(req): void {
    const roleId = Number(req?.user?.role_id);
    const allowedRoleIds = new Set([1, 3, 4, 5]);

    if (!allowedRoleIds.has(roleId)) {
      throw new ForbiddenException('Staff access only');
    }
  }
}
