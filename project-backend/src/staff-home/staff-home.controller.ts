import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StaffHomeQueryDto } from './dto/staff-home-query.dto';
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

  private ensureStaffAccess(req): void {
    const roleId = Number(req?.user?.role_id);
    const allowedRoleIds = new Set([1, 3, 4, 5]);

    if (!allowedRoleIds.has(roleId)) {
      throw new ForbiddenException('Staff access only');
    }
  }
}
