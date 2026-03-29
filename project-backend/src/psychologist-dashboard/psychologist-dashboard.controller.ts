import { Controller, Get, Query } from '@nestjs/common';
import { PsychologistDashboardService } from './psychologist-dashboard.service';

@Controller('psychologist-dashboard')
export class PsychologistDashboardController {
  constructor(
    private readonly psychologistDashboardService: PsychologistDashboardService,
  ) {}

  @Get()
  getDashboard(@Query('staffId') staffId?: string) {
    const parsedStaffId = Number(staffId);

    return this.psychologistDashboardService.getDashboard(
      Number.isFinite(parsedStaffId) ? parsedStaffId : undefined,
    );
  }
}
