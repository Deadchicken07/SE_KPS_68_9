import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PsychiatristDashboardController } from './psychiatrist-dashboard.controller';
import { PsychiatristDashboardService } from './psychiatrist-dashboard.service';

@Module({
  imports: [PrismaModule],
  controllers: [PsychiatristDashboardController],
  providers: [PsychiatristDashboardService],
})
export class PsychiatristDashboardModule {}
