import { Controller, Get, Query } from '@nestjs/common';
import { PsychiatristDashboardService } from './psychiatrist-dashboard.service';

@Controller('psychiatrist-dashboard')
export class PsychiatristDashboardController {
  constructor(
    private readonly psychiatristDashboardService: PsychiatristDashboardService,
  ) {}

  @Get()
  getDashboard(@Query('staffId') staffId?: string) {
    const parsedStaffId = Number(staffId);

    return this.psychiatristDashboardService.getDashboard(
      Number.isFinite(parsedStaffId) ? parsedStaffId : undefined,
    );
  }
}
